from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
import uuid

class User(models.Model):
    AUTH_METHOD_CHOICES = [
        ('email', 'Email/Password'),
        ('google', 'Google'),
        ('phone', 'Phone Number'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firebase_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    street_address = models.CharField(max_length=500, blank=True, null=True)
    house_number = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    town = models.CharField(max_length=255, blank=True, null=True)
    auth_method = models.CharField(max_length=20, choices=AUTH_METHOD_CHOICES)
    referral_code = models.CharField(max_length=50, unique=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    is_activated = models.BooleanField(default=False)
    earnings_wallet = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    referral_wallet = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)  # Average rating
    total_reviews = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_earnings_withdrawal = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"

class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.name

class UserSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency_level = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    years_experience = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('user', 'skill')

class Portfolio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    title = models.CharField(max_length=255)
    description = models.TextField()
    project_url = models.URLField(blank=True, null=True)
    file_path = models.CharField(max_length=500, blank=True, null=True)  # For file uploads
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"

class JobCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.name

class Job(models.Model):
    JOB_STATUS_CHOICES = [
        ('posted', 'Posted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('fixed', 'Fixed Price'),
        ('hourly', 'Hourly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(JobCategory, on_delete=models.CASCADE)
    skills_required = models.ManyToManyField(Skill, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    assigned_freelancer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='fixed')
    estimated_hours = models.IntegerField(null=True, blank=True)  # For hourly jobs
    duration = models.CharField(max_length=100, blank=True, null=True)  # e.g., "1 week", "1 month"
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='posted')
    is_urgent = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.client.email}"

class JobApplication(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE)
    cover_letter = models.TextField()
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For hourly jobs
    fixed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For fixed jobs
    portfolio_items = models.ManyToManyField(Portfolio, blank=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('job', 'freelancer')

class Milestone(models.Model):
    MILESTONE_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('paid', 'Paid'),
        ('disputed', 'Disputed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=MILESTONE_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.job.title}"

class EscrowPayment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('held', 'Held in Escrow'),
        ('released', 'Released to Freelancer'),
        ('refunded', 'Refunded to Client'),
        ('disputed', 'Disputed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, null=True, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_payments_made')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_payments_received')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='held')
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    released_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Escrow {self.amount} - {self.job.title}"

class Review(models.Model):
    REVIEW_TYPE_CHOICES = [
        ('freelancer_to_client', 'Freelancer to Client'),
        ('client_to_freelancer', 'Client to Freelancer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    review_type = models.CharField(max_length=30, choices=REVIEW_TYPE_CHOICES)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('job', 'reviewer')  # One review per job per reviewer
    
    def __str__(self):
        return f"Review {self.rating} stars from {self.reviewer.email} to {self.reviewee.email}"

class TimeLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.hours_worked} hours on {self.date} - {self.job.title}"

class Dispute(models.Model):
    DISPUTE_STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    DISPUTE_TYPE_CHOICES = [
        ('payment', 'Payment Dispute'),
        ('quality', 'Quality Issue'),
        ('deadline', 'Deadline Issue'),
        ('scope', 'Scope Dispute'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    raised_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_raised')
    against_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_against')
    dispute_type = models.CharField(max_length=20, choices=DISPUTE_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=DISPUTE_STATUS_CHOICES, default='open')
    evidence_files = models.TextField(blank=True, null=True)  # JSON string of file paths
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Dispute: {self.title} - {self.job.title}"

class Contract(models.Model):
    CONTRACT_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Signature'),
        ('active', 'Active'),
        ('terminated', 'Terminated'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(Job, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts_created')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts_signed')
    contract_terms = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=CONTRACT_STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(default=timezone.now)
    signed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Contract: {self.job.title}"

def user_file_path(instance, filename):
    """Generate file path: media/user_uploads/user_id/filename"""
    return f'user_uploads/{instance.user.id}/{filename}'

class FileUpload(models.Model):
    UPLOAD_TYPE_CHOICES = [
        ('portfolio', 'Portfolio Item'),
        ('job_file', 'Job File'),
        ('contract', 'Contract'),
        ('dispute_evidence', 'Dispute Evidence'),
        ('profile_picture', 'Profile Picture'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_file_path, max_length=500)  # New field for actual file
    original_filename = models.CharField(max_length=255)  # Store original filename
    file_size = models.BigIntegerField()  # in bytes
    upload_type = models.CharField(max_length=20, choices=UPLOAD_TYPE_CHOICES)
    related_job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    related_portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.original_filename} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        # Automatically set file_size if not provided
        if hasattr(self.file, 'size') and not self.file_size:
            self.file_size = self.file.size
        if hasattr(self.file, 'name') and not self.original_filename:
            self.original_filename = os.path.basename(self.file.name)
        super().save(*args, **kwargs)

class MpesaPayment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    mpesa_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    checkout_request_id = models.CharField(max_length=255)
    merchant_request_id = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"M-Pesa Payment {self.id} - {self.user.email}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('activation_fee', 'Activation Fee'),
        ('referral_bonus', 'Referral Bonus'),
        ('job_payment', 'Job Payment'),
        ('milestone_payment', 'Milestone Payment'),
        ('withdrawal', 'Withdrawal'),
        ('admin_adjustment', 'Admin Adjustment'),
        ('dispute_refund', 'Dispute Refund'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    wallet_type = models.CharField(max_length=20, choices=[('earnings', 'Earnings'), ('referral', 'Referral')])
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    reference = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.user.email}"

class WithdrawalRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    wallet_type = models.CharField(max_length=20, choices=[('earnings', 'Earnings'), ('referral', 'Referral')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_withdrawals')
    rejection_reason = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Withdrawal {self.status} - {self.user.email}"

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('announcement', 'Announcement'),
        ('withdrawal', 'Withdrawal'),
        ('signup', 'New Signup'),
        ('new_job', 'New Job'),
        ('job_application', 'Job Application'),
        ('job_accepted', 'Job Accepted'),
        ('job_completed', 'Job Completed'),
        ('milestone_completed', 'Milestone Completed'),
        ('payment_received', 'Payment Received'),
        ('review_received', 'Review Received'),
        ('message', 'New Message'),
        ('activation', 'Activation'),
        ('referral', 'Referral'),
        ('dispute', 'Dispute'),
        ('contract', 'Contract'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    users = models.ManyToManyField(User, blank=True, related_name='notifications')
    is_global = models.BooleanField(default=False)  # If True, sent to all users
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.notification_type} - {self.title}"

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)  # Optional job context
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Message from {self.sender.email} to {self.recipient.email}"