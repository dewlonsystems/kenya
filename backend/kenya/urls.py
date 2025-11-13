from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/verify-firebase-auth/', views.verify_firebase_auth, name='verify_firebase_auth'),
    path('api/complete-profile/', views.complete_profile, name='complete_profile'),
    path('api/initiate-activation/', views.initiate_activation, name='initiate_activation'),
    path('api/mpesa-webhook/', views.mpesa_webhook, name='mpesa_webhook'),
    path('api/overview/', views.get_overview, name='get_overview'),
    path('api/request-withdrawal/', views.request_withdrawal, name='request_withdrawal'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/search-user/', views.search_user, name='search_user'),
    path('api/send-message/', views.send_message, name='send_message'),
    path('api/get-messages/', views.get_messages, name='get_messages'),
    path('api/create-announcement/', views.create_announcement, name='create_announcement'),
    path('api/notifications/', views.get_notifications, name='get_notifications'),
    path('api/create-job/', views.create_job, name='create_job'),
    path('api/get-jobs/', views.get_jobs, name='get_jobs'),
    path('api/apply-to-job/', views.apply_to_job, name='apply_to_job'),
    path('api/accept-application/', views.accept_application, name='accept_application'),
    path('api/complete-job/', views.complete_job, name='complete_job'),
    path('api/add-skill/', views.add_skill, name='add_skill'),
    path('api/add-portfolio-item/', views.add_portfolio_item, name='add_portfolio_item'),
    path('api/submit-review/', views.submit_review, name='submit_review'),
    path('api/create-milestone/', views.create_milestone, name='create_milestone'),
    path('api/complete-milestone/', views.complete_milestone, name='complete_milestone'),
    path('api/create-dispute/', views.create_dispute, name='create_dispute'),
    path('api/get-user-profile/', views.get_user_profile, name='get_user_profile'),
    path('api/get-job-applications/', views.get_job_applications, name='get_job_applications'),
    path('api/get-assigned-jobs/', views.get_assigned_jobs, name='get_assigned_jobs'),
    path('api/get-user-reviews/', views.get_user_reviews, name='get_user_reviews'),
    path('api/upload-file/', views.upload_file, name='upload_file'),
    path('api/get-user-files/', views.get_user_files, name='get_user_files'),
    path('api/delete-file/', views.delete_file, name='delete_file'),
    path('api/wallet-transactions/', views.get_wallet_transactions, name='get_wallet_transactions'),
    path('api/withdrawal-history/', views.get_withdrawal_history, name='get_withdrawal_history'),
    path('api/add-skill/', views.add_skill, name='add_skill'),
    path('api/add-portfolio-item/', views.add_portfolio_item, name='add_portfolio_item'),
    path('api/user-status/', views.get_user_status, name='get_user_status'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)