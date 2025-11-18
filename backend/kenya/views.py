import json
import requests
import jwt
import hashlib
import hmac
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone
from django.db.models import Avg, Count, Sum, Q
from firebase_admin import auth
from .models import User, MpesaPayment, WalletTransaction, WithdrawalRequest, Notification, Message, Job, JobApplication, JobCategory, Skill, UserSkill, Portfolio, Milestone, EscrowPayment, Review, TimeLog, Dispute, Contract, FileUpload
import uuid
import os
from django.core.files.storage import default_storage

# Firebase token verification
def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token, None
    except Exception as e:
        return None, str(e)

# Generate referral code
def generate_referral_code():
    import random
    import string
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not User.objects.filter(referral_code=code).exists():
            return code

# M-Pesa integration functions
def generate_access_token():
    import base64
    from requests.auth import HTTPBasicAuth
    
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    r = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
    result = r.json()
    return result['access_token']

def initiate_mpesa_payment(phone_number, amount, user_id, description, job_id=None):
    access_token = generate_access_token()
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = f"{settings.MPESA_SHORT_CODE}{settings.MPESA_PASSKEY}{timestamp}"
    encoded_password = base64.b64encode(password.encode()).decode()
    
    payload = {
        "BusinessShortCode": settings.MPESA_SHORT_CODE,
        "Password": encoded_password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": settings.MPESA_SHORT_CODE,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": f"Payment_{user_id}",
        "TransactionDesc": description
    }
    
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

@csrf_exempt
def verify_firebase_auth(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            data = json.loads(request.body)
            id_token = data.get('idToken')
            
            if not id_token:
                return JsonResponse({'error': 'ID token is required'}, status=400)
            
            # Verify the Firebase token
            decoded_token, error = verify_firebase_token(id_token)
            if error:
                return JsonResponse({'error': f'Invalid token: {error}'}, status=400)
            
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
            phone_number = decoded_token.get('phone_number')
            auth_method = decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown')
            
            # Check if user exists in our database
            try:
                user = User.objects.get(email=email)
                user_exists = True
                user_id = str(user.id)
                is_activated = user.is_activated
            except User.DoesNotExist:
                # User doesn't exist in our database yet (new user)
                user_exists = False
                user_id = None
                is_activated = False
            
            return JsonResponse({
                'firebase_uid': firebase_uid,
                'email': email,
                'phone_number': phone_number,
                'auth_method': auth_method,
                'user_exists': user_exists,
                'user_id': user_id,  # This will be None for new users
                'is_activated': is_activated
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def complete_profile(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            firebase_uid = data.get('firebase_uid')
            email = data.get('email')
            full_name = data.get('full_name')
            phone_number = data.get('phone_number')
            street_address = data.get('street_address')
            house_number = data.get('house_number')
            zip_code = data.get('zip_code')
            town = data.get('town')
            referral_code_input = data.get('referral_code')  # Optional referral code
            
            if not firebase_uid or not email:
                return JsonResponse({'error': 'Firebase UID and email are required'}, status=400)
            
            # Validate email format
            try:
                validate_email(email)
            except ValidationError:
                return JsonResponse({'error': 'Invalid email format'}, status=400)
            
            # Check if user already exists
            existing_user = User.objects.filter(email=email).first()
            if existing_user:
                return JsonResponse({'error': 'User with this email already exists'}, status=400)
            
            # Check referral code if provided
            referred_by_user = None
            if referral_code_input:
                referred_by_user = User.objects.filter(referral_code=referral_code_input).first()
                if not referred_by_user:
                    return JsonResponse({'error': 'Invalid referral code'}, status=400)
            
            # Generate unique referral code
            referral_code = generate_referral_code()
            
            # Determine auth method based on available info
            auth_method = 'email'
            if data.get('auth_method'):
                auth_method = data.get('auth_method')
            
            # Create user
            user = User.objects.create(
                firebase_uid=firebase_uid,
                email=email,
                full_name=full_name,
                phone_number=phone_number,
                street_address=street_address,
                house_number=house_number,
                zip_code=zip_code,
                town=town,
                auth_method=auth_method,
                referral_code=referral_code,
                referred_by=referred_by_user
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Profile completed successfully',
                'user_id': str(user.id),
                'referral_code': user.referral_code
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def initiate_activation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            phone_number = data.get('phone_number')
            amount = data.get('amount', 1000)  # Default activation fee
            
            user = User.objects.get(id=user_id)
            
            # Create pending payment record
            checkout_request_id = f"CK{uuid.uuid4().hex[:10].upper()}"
            merchant_request_id = f"MR{uuid.uuid4().hex[:10].upper()}"
            
            payment = MpesaPayment.objects.create(
                user=user,
                amount=amount,
                checkout_request_id=checkout_request_id,
                merchant_request_id=merchant_request_id,
                phone_number=phone_number,
                description='Account Activation Fee'
            )
            
            # Initiate M-Pesa payment
            mpesa_response = initiate_mpesa_payment(
                phone_number, amount, user.id, 'Account Activation Fee'
            )
            
            if mpesa_response.get('ResponseCode') == '0':
                return JsonResponse({
                    'success': True,
                    'message': 'Payment initiated successfully',
                    'CheckoutRequestID': checkout_request_id
                })
            else:
                payment.status = 'failed'
                payment.save()
                return JsonResponse({
                    'error': 'Failed to initiate payment',
                    'details': mpesa_response
                }, status=400)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def mpesa_webhook(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Verify the callback is from M-Pesa
            # Add your signature verification logic here
            
            merchant_request_id = data['Body']['stkCallback']['MerchantRequestID']
            checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']
            result_code = data['Body']['stkCallback']['ResultCode']
            result_desc = data['Body']['stkCallback']['ResultDesc']
            
            try:
                payment = MpesaPayment.objects.get(checkout_request_id=checkout_request_id)
                
                if result_code == 0:  # Success
                    payment.status = 'completed'
                    payment.completed_at = timezone.now()
                    payment.mpesa_transaction_id = data['Body']['stkCallback']['CallbackMetadata']['Item'][1]['Value']  # Transaction ID
                    payment.save()
                    
                    # Activate user
                    user = payment.user
                    user.is_activated = True
                    user.save()
                    
                    # Process referral bonus if applicable
                    if user.referred_by and user.referred_by.is_activated:
                        # Credit referral bonus to referrer's referral wallet
                        bonus_amount = 50.00  # KSh 50
                        user.referred_by.referral_wallet += bonus_amount
                        user.referred_by.save()
                        
                        # Record transaction
                        WalletTransaction.objects.create(
                            user=user.referred_by,
                            transaction_type='referral_bonus',
                            amount=bonus_amount,
                            wallet_type='referral',
                            description=f'Referral bonus from {user.email}',
                            reference=f'REF_{user.id}'
                        )
                        
                        # Create notification for referrer
                        Notification.objects.create(
                            title='Referral Bonus Received',
                            message=f'You received KSh {bonus_amount} for referring {user.full_name}',
                            notification_type='referral',
                            users=[user.referred_by]
                        )
                    
                    # Create activation notification for user
                    Notification.objects.create(
                        title='Account Activated',
                        message='Your account has been successfully activated',
                        notification_type='activation',
                        users=[user]
                    )
                    
                    return JsonResponse({'Result': 'Success'})
                else:
                    payment.status = 'failed'
                    payment.save()
                    return JsonResponse({'Result': 'Failed'})
            except MpesaPayment.DoesNotExist:
                return JsonResponse({'Result': 'Payment not found'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_overview(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Calculate overview data
            total_completed_jobs = Job.objects.filter(
                Q(client=user) | Q(assigned_freelancer=user),
                status='completed'
            ).count()
            
            pending_jobs = Job.objects.filter(
                Q(client=user) | Q(assigned_freelancer=user),
                status='in_progress'
            ).count()
            
            referral_earnings = WalletTransaction.objects.filter(
                user=user, 
                transaction_type='referral_bonus',
                wallet_type='referral'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            unread_messages = Message.objects.filter(
                recipient=user, 
                is_read=False
            ).count()
            
            # Get user's job applications
            pending_applications = JobApplication.objects.filter(
                freelancer=user,
                status='pending'
            ).count()
            
            # Get assigned jobs
            assigned_jobs = Job.objects.filter(
                assigned_freelancer=user,
                status='in_progress'
            ).count()
            
            return JsonResponse({
                'wallet_balance': float(user.earnings_wallet + user.referral_wallet),
                'earnings_wallet': float(user.earnings_wallet),
                'referral_wallet': float(user.referral_wallet),
                'total_completed_jobs': total_completed_jobs,
                'pending_jobs': pending_jobs,
                'referral_earnings': float(referral_earnings),
                'unread_messages': unread_messages,
                'date_joined': user.created_at.isoformat(),
                'is_activated': user.is_activated,
                'rating': float(user.rating),
                'total_reviews': user.total_reviews,
                'pending_applications': pending_applications,
                'assigned_jobs': assigned_jobs
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def request_withdrawal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            amount = float(data.get('amount'))
            wallet_type = data.get('wallet_type')  # 'earnings' or 'referral'
            
            user = User.objects.get(id=user_id)
            
            # Validate withdrawal rules
            if wallet_type == 'earnings':
                # Earnings wallet: can only withdraw once per month or if admin allows
                last_withdrawal = user.last_earnings_withdrawal
                if last_withdrawal:
                    one_month_ago = timezone.now() - timedelta(days=30)
                    if last_withdrawal > one_month_ago:
                        return JsonResponse({
                            'error': 'Earnings wallet can only be withdrawn once per month'
                        }, status=400)
                
                if amount > float(user.earnings_wallet):
                    return JsonResponse({'error': 'Insufficient balance in earnings wallet'}, status=400)
            
            elif wallet_type == 'referral':
                # Referral wallet: can withdraw if balance > 100
                if amount > float(user.referral_wallet):
                    return JsonResponse({'error': 'Insufficient balance in referral wallet'}, status=400)
                
                if amount < 100:
                    return JsonResponse({'error': 'Minimum withdrawal amount is KSh 100 for referral wallet'}, status=400)
            
            else:
                return JsonResponse({'error': 'Invalid wallet type'}, status=400)
            
            # Create withdrawal request
            withdrawal = WithdrawalRequest.objects.create(
                user=user,
                amount=amount,
                wallet_type=wallet_type
            )
            
            # Create notification for admin
            Notification.objects.create(
                title='New Withdrawal Request',
                message=f'User {user.email} requested withdrawal of KSh {amount}',
                notification_type='withdrawal',
                is_global=True  # This will be seen by admins
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Withdrawal request submitted successfully',
                'request_id': str(withdrawal.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_profile(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            updates = {}
            
            # Collect updates
            if 'full_name' in data:
                updates['full_name'] = data['full_name']
            if 'phone_number' in data:
                updates['phone_number'] = data['phone_number']
            if 'street_address' in data:
                updates['street_address'] = data['street_address']
            if 'house_number' in data:
                updates['house_number'] = data['house_number']
            if 'zip_code' in data:
                updates['zip_code'] = data['zip_code']
            if 'town' in data:
                updates['town'] = data['town']
            
            user = User.objects.get(id=user_id)
            
            # Update fields
            for field, value in updates.items():
                setattr(user, field, value)
            
            user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully'
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def search_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            search_term = data.get('search_term')  # Could be email or referral code
            
            # Search by email or referral code
            user = User.objects.filter(
                Q(email=search_term) | Q(referral_code=search_term)
            ).first()
            
            if user:
                return JsonResponse({
                    'user_found': True,
                    'user_id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'referral_code': user.referral_code,
                    'rating': float(user.rating),
                    'total_reviews': user.total_reviews
                })
            else:
                return JsonResponse({
                    'user_found': False,
                    'message': 'User not found'
                })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def send_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sender_id = data.get('sender_id')
            recipient_id = data.get('recipient_id')
            content = data.get('content')
            subject = data.get('subject', '')
            job_id = data.get('job_id')  # Optional job context
            
            sender = User.objects.get(id=sender_id)
            recipient = User.objects.get(id=recipient_id)
            job = None
            if job_id:
                job = Job.objects.get(id=job_id)
            
            message = Message.objects.create(
                sender=sender,
                recipient=recipient,
                subject=subject,
                content=content,
                job=job
            )
            
            # Create notification for recipient
            Notification.objects.create(
                title='New Message',
                message=f'You have a new message from {sender.full_name}',
                notification_type='message',
                users=[recipient]
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Message sent successfully',
                'message_id': str(message.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'Sender or recipient not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_messages(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get messages sent to this user
            received_messages = Message.objects.filter(recipient=user).order_by('-sent_at')
            
            messages_data = []
            for msg in received_messages:
                messages_data.append({
                    'id': str(msg.id),
                    'sender': msg.sender.full_name,
                    'sender_email': msg.sender.email,
                    'subject': msg.subject,
                    'content': msg.content,
                    'sent_at': msg.sent_at.isoformat(),
                    'is_read': msg.is_read,
                    'job_id': str(msg.job.id) if msg.job else None,
                    'job_title': msg.job.title if msg.job else None
                })
            
            return JsonResponse({
                'messages': messages_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def create_announcement(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            message = data.get('message')
            
            # Create global notification
            notification = Notification.objects.create(
                title=title,
                message=message,
                notification_type='announcement',
                is_global=True
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Announcement created successfully',
                'notification_id': str(notification.id)
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_notifications(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get user-specific and global notifications
            notifications = Notification.objects.filter(
                Q(users=user) | Q(is_global=True)
            ).order_by('-created_at')
            
            notifications_data = []
            for notif in notifications:
                notifications_data.append({
                    'id': str(notif.id),
                    'title': notif.title,
                    'message': notif.message,
                    'type': notif.notification_type,
                    'created_at': notif.created_at.isoformat(),
                    'is_read': notif.is_read
                })
            
            return JsonResponse({
                'notifications': notifications_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Job Management Functions
@csrf_exempt
def create_job(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            client_id = data.get('client_id')
            title = data.get('title')
            description = data.get('description')
            category_id = data.get('category_id')
            skills_required = data.get('skills_required', [])  # List of skill IDs
            budget_min = data.get('budget_min')
            budget_max = data.get('budget_max')
            payment_type = data.get('payment_type', 'fixed')
            estimated_hours = data.get('estimated_hours')
            duration = data.get('duration')
            is_urgent = data.get('is_urgent', False)
            
            client = User.objects.get(id=client_id)
            
            # Validate client is activated
            if not client.is_activated:
                return JsonResponse({'error': 'Client account must be activated to post jobs'}, status=400)
            
            # Create job
            job = Job.objects.create(
                title=title,
                description=description,
                category_id=category_id,
                client=client,
                budget_min=budget_min,
                budget_max=budget_max,
                payment_type=payment_type,
                estimated_hours=estimated_hours,
                duration=duration,
                is_urgent=is_urgent
            )
            
            # Add skills required
            for skill_id in skills_required:
                skill = Skill.objects.get(id=skill_id)
                job.skills_required.add(skill)
            
            # Create notification for freelancers with matching skills
            matching_freelancers = User.objects.filter(
                user_skills__skill_id__in=skills_required,
                is_activated=True,
                is_available=True
            ).distinct()
            
            if matching_freelancers.exists():
                notification = Notification.objects.create(
                    title='New Job Available',
                    message=f'New job posted: {title}',
                    notification_type='new_job'
                )
                notification.users.set(matching_freelancers)
            
            return JsonResponse({
                'success': True,
                'message': 'Job created successfully',
                'job_id': str(job.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'Client not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_jobs(request):
    if request.method == 'GET':
        try:
            # Get filters
            category_id = request.GET.get('category_id')
            min_budget = request.GET.get('min_budget')
            max_budget = request.GET.get('max_budget')
            search_term = request.GET.get('search_term', '')
            skills_required = request.GET.get('skills_required', '')  # Comma-separated skill IDs
            
            jobs = Job.objects.filter(status='posted', client__is_activated=True)
            
            if category_id:
                jobs = jobs.filter(category_id=category_id)
            
            if min_budget:
                jobs = jobs.filter(budget_max__gte=min_budget)
            
            if max_budget:
                jobs = jobs.filter(budget_min__lte=max_budget)
            
            if search_term:
                jobs = jobs.filter(
                    Q(title__icontains=search_term) | 
                    Q(description__icontains=search_term)
                )
            
            if skills_required:
                skill_ids = skills_required.split(',')
                for skill_id in skill_ids:
                    jobs = jobs.filter(skills_required__id=skill_id)
            
            jobs_data = []
            for job in jobs:
                jobs_data.append({
                    'id': str(job.id),
                    'title': job.title,
                    'description': job.description,
                    'category': job.category.name,
                    'client_name': job.client.full_name,
                    'client_rating': float(job.client.rating),
                    'budget_min': float(job.budget_min),
                    'budget_max': float(job.budget_max),
                    'payment_type': job.payment_type,
                    'estimated_hours': job.estimated_hours,
                    'duration': job.duration,
                    'is_urgent': job.is_urgent,
                    'created_at': job.created_at.isoformat(),
                    'applicants_count': job.applications.filter(status='pending').count(),
                    'skills_required': [
                        {'id': str(skill.id), 'name': skill.name}
                        for skill in job.skills_required.all()
                    ]
                })
            
            return JsonResponse({
                'jobs': jobs_data
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def apply_to_job(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            freelancer_id = data.get('freelancer_id')
            job_id = data.get('job_id')
            cover_letter = data.get('cover_letter')
            hourly_rate = data.get('hourly_rate')
            fixed_price = data.get('fixed_price')
            portfolio_ids = data.get('portfolio_ids', [])
            
            freelancer = User.objects.get(id=freelancer_id)
            job = Job.objects.get(id=job_id)
            
            # Check if freelancer is activated
            if not freelancer.is_activated:
                return JsonResponse({'error': 'Freelancer must be activated to apply'}, status=400)
            
            # Check if already applied
            existing_application = JobApplication.objects.filter(
                job=job, freelancer=freelancer
            ).first()
            
            if existing_application:
                return JsonResponse({'error': 'Already applied to this job'}, status=400)
            
            # Create application
            application = JobApplication.objects.create(
                job=job,
                freelancer=freelancer,
                cover_letter=cover_letter,
                hourly_rate=hourly_rate,
                fixed_price=fixed_price
            )
            
            # Add portfolio items
            for portfolio_id in portfolio_ids:
                portfolio = Portfolio.objects.get(id=portfolio_id)
                application.portfolio_items.add(portfolio)
            
            # Create notification for client
            Notification.objects.create(
                title='New Job Application',
                message=f'New application received for job: {job.title}',
                notification_type='job_application',
                users=[job.client]
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Application submitted successfully',
                'application_id': str(application.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'Freelancer not found'}, status=404)
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def accept_application(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            application_id = data.get('application_id')
            client_id = data.get('client_id')
            
            application = JobApplication.objects.get(id=application_id)
            
            # Verify this client posted the job
            if application.job.client.id != client_id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            # Check if job already assigned
            if application.job.assigned_freelancer:
                return JsonResponse({'error': 'Job already assigned'}, status=400)
            
            # Accept the application
            application.status = 'accepted'
            application.save()
            
            # Assign freelancer to job
            job = application.job
            job.assigned_freelancer = application.freelancer
            job.status = 'in_progress'
            job.save()
            
            # Create notification for freelancer
            Notification.objects.create(
                title='Job Application Accepted',
                message=f'Your application for job "{job.title}" has been accepted',
                notification_type='job_accepted',
                users=[application.freelancer]
            )
            
            # Create contract
            Contract.objects.create(
                job=job,
                client=job.client,
                freelancer=application.freelancer,
                contract_terms=f'Terms for job: {job.title}',
                start_date=timezone.now().date()
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Application accepted and job assigned',
                'job_id': str(job.id)
            })
        except JobApplication.DoesNotExist:
            return JsonResponse({'error': 'Application not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def complete_job(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            job_id = data.get('job_id')
            user_id = data.get('user_id')  # Either client or freelancer completing
            final_amount = data.get('final_amount')  # For final payment
            
            job = Job.objects.get(id=job_id)
            
            # Verify authorization (either client or assigned freelancer)
            if str(job.client.id) != user_id and str(job.assigned_freelancer.id) != user_id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            # Complete the job
            job.status = 'completed'
            job.completed_at = timezone.now()
            job.save()
            
            # Process final payment (release from escrow or direct payment)
            if final_amount:
                # Add to freelancer's earnings wallet
                freelancer = job.assigned_freelancer
                freelancer.earnings_wallet += final_amount
                freelancer.total_earnings += final_amount
                freelancer.save()
                
                # Record transaction
                WalletTransaction.objects.create(
                    user=freelancer,
                    job=job,
                    transaction_type='job_payment',
                    amount=final_amount,
                    wallet_type='earnings',
                    description=f'Payment for job completion: {job.title}'
                )
            
            # Create notification for both parties
            Notification.objects.create(
                title='Job Completed',
                message=f'Job "{job.title}" has been marked as completed',
                notification_type='job_completed',
                users=[job.client, job.assigned_freelancer]
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Job completed successfully'
            })
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Skill and Portfolio Management
@csrf_exempt
def add_skill(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            skill_name = data.get('skill_name')
            proficiency_level = data.get('proficiency_level', 3)  # 1-5 stars
            years_experience = data.get('years_experience', 0)
            
            user = User.objects.get(id=user_id)
            
            # Get or create skill
            skill, created = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'name': skill_name}
            )
            
            # Add skill to user
            user_skill, created = UserSkill.objects.get_or_create(
                user=user,
                skill=skill,
                defaults={
                    'proficiency_level': proficiency_level,
                    'years_experience': years_experience
                }
            )
            
            if not created:
                # Update existing skill
                user_skill.proficiency_level = proficiency_level
                user_skill.years_experience = years_experience
                user_skill.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Skill added successfully',
                'skill_id': str(skill.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def add_portfolio_item(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            title = data.get('title')
            description = data.get('description')
            project_url = data.get('project_url')
            
            user = User.objects.get(id=user_id)
            
            portfolio = Portfolio.objects.create(
                user=user,
                title=title,
                description=description,
                project_url=project_url
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Portfolio item added successfully',
                'portfolio_id': str(portfolio.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Review System
@csrf_exempt
def submit_review(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            job_id = data.get('job_id')
            reviewer_id = data.get('reviewer_id')
            reviewee_id = data.get('reviewee_id')
            rating = data.get('rating')  # 1-5 stars
            comment = data.get('comment')
            
            job = Job.objects.get(id=job_id)
            reviewer = User.objects.get(id=reviewer_id)
            reviewee = User.objects.get(id=reviewee_id)
            
            # Verify that reviewer was involved in the job
            if not ((job.client.id == reviewer.id and job.assigned_freelancer.id == reviewee.id) or
                   (job.assigned_freelancer.id == reviewer.id and job.client.id == reviewee.id)):
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            # Check if review already exists for this job
            existing_review = Review.objects.filter(
                job=job, reviewer=reviewer
            ).first()
            
            if existing_review:
                return JsonResponse({'error': 'Review already submitted for this job'}, status=400)
            
            # Create review
            review = Review.objects.create(
                job=job,
                reviewer=reviewer,
                reviewee=reviewee,
                review_type='client_to_freelancer' if job.client.id == reviewer.id else 'freelancer_to_client',
                rating=rating,
                comment=comment
            )
            
            # Update reviewee's rating
            reviews = Review.objects.filter(reviewee=reviewee)
            avg_rating = reviews.aggregate(avg=Avg('rating'))['avg']
            reviewee.rating = avg_rating or 0
            reviewee.total_reviews = reviews.count()
            reviewee.save()
            
            # Create notification for reviewee
            Notification.objects.create(
                title='New Review Received',
                message=f'You received a {rating}-star review for job: {job.title}',
                notification_type='review_received',
                users=[reviewee]
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Review submitted successfully'
            })
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Milestone and Escrow System
@csrf_exempt
def create_milestone(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            job_id = data.get('job_id')
            title = data.get('title')
            description = data.get('description')
            amount = data.get('amount')
            due_date = data.get('due_date')  # ISO format
            
            job = Job.objects.get(id=job_id)
            
            # Verify authorization (client only)
            if str(job.client.id) != request.user.id:  # You'll need to implement proper authentication
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            milestone = Milestone.objects.create(
                job=job,
                title=title,
                description=description,
                amount=amount,
                due_date=due_date
            )
            
            # Create escrow payment for this milestone
            EscrowPayment.objects.create(
                job=job,
                milestone=milestone,
                client=job.client,
                freelancer=job.assigned_freelancer,
                amount=amount,
                description=f'Milestone: {title}'
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Milestone created successfully',
                'milestone_id': str(milestone.id)
            })
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def complete_milestone(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            milestone_id = data.get('milestone_id')
            user_id = data.get('user_id')  # Either client or freelancer
            
            milestone = Milestone.objects.get(id=milestone_id)
            
            # Verify authorization
            if str(milestone.job.client.id) != user_id and str(milestone.job.assigned_freelancer.id) != user_id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            # Complete milestone
            milestone.status = 'completed'
            milestone.completed_at = timezone.now()
            milestone.save()
            
            # Release payment from escrow
            escrow = EscrowPayment.objects.filter(
                milestone=milestone,
                status='held'
            ).first()
            
            if escrow:
                escrow.status = 'released'
                escrow.released_at = timezone.now()
                escrow.save()
                
                # Add to freelancer's earnings
                freelancer = milestone.job.assigned_freelancer
                freelancer.earnings_wallet += milestone.amount
                freelancer.total_earnings += milestone.amount
                freelancer.save()
                
                # Record transaction
                WalletTransaction.objects.create(
                    user=freelancer,
                    job=milestone.job,
                    transaction_type='milestone_payment',
                    amount=milestone.amount,
                    wallet_type='earnings',
                    description=f'Milestone payment: {milestone.title}'
                )
            
            # Create notification
            Notification.objects.create(
                title='Milestone Completed',
                message=f'Milestone "{milestone.title}" has been completed and payment released',
                notification_type='milestone_completed',
                users=[milestone.job.client, milestone.job.assigned_freelancer]
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Milestone completed successfully'
            })
        except Milestone.DoesNotExist:
            return JsonResponse({'error': 'Milestone not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Dispute System
@csrf_exempt
def create_dispute(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            job_id = data.get('job_id')
            raised_by_id = data.get('raised_by_id')
            against_user_id = data.get('against_user_id')
            dispute_type = data.get('dispute_type')
            title = data.get('title')
            description = data.get('description')
            
            job = Job.objects.get(id=job_id)
            raised_by = User.objects.get(id=raised_by_id)
            against_user = User.objects.get(id=against_user_id)
            
            # Verify that the user is involved in the job
            if not (job.client.id == raised_by.id or job.assigned_freelancer.id == raised_by.id):
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            dispute = Dispute.objects.create(
                job=job,
                raised_by=raised_by,
                against_user=against_user,
                dispute_type=dispute_type,
                title=title,
                description=description
            )
            
            # Update job status to disputed
            job.status = 'disputed'
            job.save()
            
            # Create notification for admins
            Notification.objects.create(
                title='New Dispute Filed',
                message=f'Dispute filed: {title} for job {job.title}',
                notification_type='dispute',
                is_global=True
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Dispute created successfully',
                'dispute_id': str(dispute.id)
            })
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Get user profile with skills and portfolio
def get_user_profile(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get user skills
            user_skills = UserSkill.objects.filter(user=user).select_related('skill')
            skills_data = []
            for user_skill in user_skills:
                skills_data.append({
                    'skill_id': str(user_skill.skill.id),
                    'skill_name': user_skill.skill.name,
                    'proficiency_level': user_skill.proficiency_level,
                    'years_experience': user_skill.years_experience
                })
            
            # Get user portfolio
            portfolio_items = Portfolio.objects.filter(user=user)
            portfolio_data = []
            for item in portfolio_items:
                portfolio_data.append({
                    'id': str(item.id),
                    'title': item.title,
                    'description': item.description,
                    'project_url': item.project_url,
                    'created_at': item.created_at.isoformat()
                })
            
            return JsonResponse({
                'user_id': str(user.id),
                'full_name': user.full_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'rating': float(user.rating),
                'total_reviews': user.total_reviews,
                'total_earnings': float(user.total_earnings),
                'skills': skills_data,
                'portfolio': portfolio_data,
                'is_available': user.is_available
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Get job applications for a user
def get_job_applications(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get applications made by this freelancer
            applications = JobApplication.objects.filter(freelancer=user).select_related('job', 'job__client')
            
            applications_data = []
            for app in applications:
                applications_data.append({
                    'id': str(app.id),
                    'job_id': str(app.job.id),
                    'job_title': app.job.title,
                    'job_client': app.job.client.full_name,
                    'cover_letter': app.cover_letter,
                    'status': app.status,
                    'applied_at': app.applied_at.isoformat(),
                    'job_budget_min': float(app.job.budget_min),
                    'job_budget_max': float(app.job.budget_max)
                })
            
            return JsonResponse({
                'applications': applications_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Get assigned jobs for a freelancer
def get_assigned_jobs(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get jobs assigned to this freelancer
            jobs = Job.objects.filter(assigned_freelancer=user).select_related('client')
            
            jobs_data = []
            for job in jobs:
                jobs_data.append({
                    'id': str(job.id),
                    'title': job.title,
                    'description': job.description,
                    'client_name': job.client.full_name,
                    'client_email': job.client.email,
                    'budget_min': float(job.budget_min),
                    'budget_max': float(job.budget_max),
                    'status': job.status,
                    'created_at': job.created_at.isoformat(),
                    'completed_at': job.completed_at.isoformat() if job.completed_at else None,
                    'skills_required': [
                        {'id': str(skill.id), 'name': skill.name}
                        for skill in job.skills_required.all()
                    ]
                })
            
            return JsonResponse({
                'assigned_jobs': jobs_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# NEW: Get user reviews
def get_user_reviews(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get reviews received by this user
            reviews = Review.objects.filter(reviewee=user).select_related('reviewer', 'job')
            
            reviews_data = []
            for review in reviews:
                reviews_data.append({
                    'id': str(review.id),
                    'job_title': review.job.title,
                    'reviewer_name': review.reviewer.full_name,
                    'rating': review.rating,
                    'comment': review.comment,
                    'created_at': review.created_at.isoformat(),
                    'review_type': review.review_type
                })
            
            return JsonResponse({
                'reviews': reviews_data,
                'average_rating': float(user.rating),
                'total_reviews': user.total_reviews
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('user_id')
            upload_type = request.POST.get('upload_type', 'other')
            related_job_id = request.POST.get('related_job_id')
            related_portfolio_id = request.POST.get('related_portfolio_id')
            
            if 'file' not in request.FILES:
                return JsonResponse({'error': 'No file provided'}, status=400)
            
            user = User.objects.get(id=user_id)
            uploaded_file = request.FILES['file']
            
            # Validate file size (optional: max 10MB)
            if uploaded_file.size > 10 * 1024 * 1024:  # 10MB
                return JsonResponse({'error': 'File too large. Maximum 10MB allowed.'}, status=400)
            
            # Create file upload record
            file_upload = FileUpload.objects.create(
                user=user,
                file=uploaded_file,
                upload_type=upload_type,
                file_size=uploaded_file.size
            )
            
            if related_job_id:
                job = Job.objects.get(id=related_job_id)
                file_upload.related_job = job
                file_upload.save()
            
            if related_portfolio_id:
                portfolio = Portfolio.objects.get(id=related_portfolio_id)
                file_upload.related_portfolio = portfolio
                file_upload.save()
            
            return JsonResponse({
                'success': True,
                'message': 'File uploaded successfully',
                'file_id': str(file_upload.id),
                'file_url': file_upload.file.url if hasattr(file_upload.file, 'url') else str(file_upload.file),
                'file_size': file_upload.file_size
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Job.DoesNotExist:
            return JsonResponse({'error': 'Job not found'}, status=404)
        except Portfolio.DoesNotExist:
            return JsonResponse({'error': 'Portfolio not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_user_files(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            upload_type = request.GET.get('upload_type')  # Optional filter
            
            user = User.objects.get(id=user_id)
            
            files_query = FileUpload.objects.filter(user=user)
            if upload_type:
                files_query = files_query.filter(upload_type=upload_type)
            
            files_data = []
            for file_upload in files_query.order_by('-uploaded_at'):
                files_data.append({
                    'id': str(file_upload.id),
                    'original_filename': file_upload.original_filename,
                    'file_url': file_upload.file.url if hasattr(file_upload.file, 'url') else str(file_upload.file),
                    'file_size': file_upload.file_size,
                    'upload_type': file_upload.upload_type,
                    'uploaded_at': file_upload.uploaded_at.isoformat(),
                    'related_job_id': str(file_upload.related_job.id) if file_upload.related_job else None,
                    'related_portfolio_id': str(file_upload.related_portfolio.id) if file_upload.related_portfolio else None
                })
            
            return JsonResponse({
                'files': files_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_file(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            file_id = data.get('file_id')
            user_id = data.get('user_id')
            
            file_upload = FileUpload.objects.get(id=file_id, user_id=user_id)
            
            # Delete the actual file from storage
            if file_upload.file:
                if os.path.isfile(file_upload.file.path):
                    os.remove(file_upload.file.path)
            
            file_upload.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'File deleted successfully'
            })
        except FileUpload.DoesNotExist:
            return JsonResponse({'error': 'File not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Update the add_portfolio_item function to handle file uploads
@csrf_exempt
def add_portfolio_item(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('user_id')
            title = request.POST.get('title')
            description = request.POST.get('description')
            project_url = request.POST.get('project_url', '')
            
            user = User.objects.get(id=user_id)
            
            # Create portfolio item
            portfolio = Portfolio.objects.create(
                user=user,
                title=title,
                description=description,
                project_url=project_url
            )
            
            # Handle file upload if provided
            if 'file' in request.FILES:
                uploaded_file = request.FILES['file']
                
                file_upload = FileUpload.objects.create(
                    user=user,
                    file=uploaded_file,
                    upload_type='portfolio',
                    related_portfolio=portfolio,
                    file_size=uploaded_file.size
                )
                
                # You can store the file path in the portfolio if needed
                portfolio.file_path = file_upload.file.url
                portfolio.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Portfolio item added successfully',
                'portfolio_id': str(portfolio.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_wallet_transactions(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'User ID is required'}, status=400)
            
            user = User.objects.get(id=user_id)
            transactions = WalletTransaction.objects.filter(user=user).order_by('-created_at')
            
            transactions_data = []
            for transaction in transactions:
                transactions_data.append({
                    'id': str(transaction.id),
                    'transaction_type': transaction.transaction_type,
                    'amount': float(transaction.amount),
                    'wallet_type': transaction.wallet_type,
                    'description': transaction.description,
                    'created_at': transaction.created_at.isoformat(),
                    'reference': transaction.reference
                })
            
            return JsonResponse({
                'transactions': transactions_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_withdrawal_history(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'User ID is required'}, status=400)
            
            user = User.objects.get(id=user_id)
            withdrawals = WithdrawalRequest.objects.filter(user=user).order_by('-requested_at')
            
            withdrawals_data = []
            for withdrawal in withdrawals:
                withdrawals_data.append({
                    'id': str(withdrawal.id),
                    'amount': float(withdrawal.amount),
                    'wallet_type': withdrawal.wallet_type,
                    'status': withdrawal.status,
                    'requested_at': withdrawal.requested_at.isoformat(),
                    'processed_at': withdrawal.processed_at.isoformat() if withdrawal.processed_at else None,
                    'rejection_reason': withdrawal.rejection_reason
                })
            
            return JsonResponse({
                'withdrawals': withdrawals_data
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def add_skill(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            skill_name = data.get('skill_name')
            proficiency_level = data.get('proficiency_level', 3)
            years_experience = data.get('years_experience', 0)
            
            user = User.objects.get(id=user_id)
            
            # Get or create skill
            skill, created = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'name': skill_name}
            )
            
            # Add skill to user
            user_skill, created = UserSkill.objects.get_or_create(
                user=user,
                skill=skill,
                defaults={
                    'proficiency_level': proficiency_level,
                    'years_experience': years_experience
                }
            )
            
            if not created:
                # Update existing skill
                user_skill.proficiency_level = proficiency_level
                user_skill.years_experience = years_experience
                user_skill.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Skill added successfully',
                'skill_id': str(skill.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def add_portfolio_item(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('user_id')
            title = request.POST.get('title')
            description = request.POST.get('description')
            project_url = request.POST.get('project_url', '')
            
            user = User.objects.get(id=user_id)
            
            portfolio = Portfolio.objects.create(
                user=user,
                title=title,
                description=description,
                project_url=project_url
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Portfolio item added successfully',
                'portfolio_id': str(portfolio.id)
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def get_user_status(request):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'User ID is required'}, status=400)
            
            user = User.objects.get(id=user_id)
            
            return JsonResponse({
                'user_id': str(user.id),
                'is_activated': user.is_activated,
                'email': user.email,
                'full_name': user.full_name,
                'phone_number': user.phone_number
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            if not user.check_password(password):
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            if not user.is_active:
                return JsonResponse({'error': 'User is inactive'}, status=401)

            # Successful login
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user_id': str(user.id),
                'full_name': user.full_name,
                'email': user.email,
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
