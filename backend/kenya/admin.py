from django.contrib import admin
from django.contrib.auth.models import Group
from .models import (
    User, Skill, UserSkill, Portfolio, JobCategory, Job, JobApplication,
    Milestone, EscrowPayment, Review, TimeLog, Dispute, Contract,
    FileUpload, MpesaPayment, WalletTransaction, WithdrawalRequest,
    Notification, Message
)

# Unregister the default Group model to keep admin clean
admin.site.unregister(Group)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone_number', 'auth_method', 
                   'is_activated', 'is_available', 'rating', 'total_reviews', 'created_at']
    list_filter = ['is_activated', 'is_available', 'auth_method', 'created_at']
    search_fields = ['full_name', 'email', 'phone_number', 'referral_code']
    readonly_fields = ['id', 'firebase_uid', 'referral_code', 'created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    search_fields = ['name', 'category']
    list_filter = ['category', 'created_at']

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'proficiency_level', 'years_experience', 'created_at']
    list_filter = ['proficiency_level', 'years_experience']
    search_fields = ['user__full_name', 'user__email', 'skill__name']

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at']
    search_fields = ['title', 'description', 'user__full_name', 'user__email']
    list_filter = ['created_at']

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'assigned_freelancer', 'status', 'budget_min', 'budget_max', 'created_at']
    list_filter = ['status', 'payment_type', 'is_urgent', 'created_at']
    search_fields = ['title', 'description', 'client__full_name', 'client__email']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['job', 'freelancer', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['job__title', 'freelancer__full_name', 'freelancer__email']

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'job', 'amount', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'job__title']

@admin.register(EscrowPayment)
class EscrowPaymentAdmin(admin.ModelAdmin):
    list_display = ['job', 'client', 'freelancer', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['job__title', 'client__full_name', 'freelancer__full_name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['job', 'reviewer', 'reviewee', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['job__title', 'reviewer__full_name', 'reviewee__full_name', 'comment']

@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    list_display = ['job', 'freelancer', 'date', 'hours_worked', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['job__title', 'freelancer__full_name', 'description']

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ['title', 'job', 'raised_by', 'against_user', 'status', 'created_at']
    list_filter = ['status', 'dispute_type', 'created_at']
    search_fields = ['title', 'description', 'job__title']

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['job', 'client', 'freelancer', 'status', 'start_date', 'created_at']
    list_filter = ['status', 'start_date', 'created_at']
    search_fields = ['job__title', 'client__full_name', 'freelancer__full_name']

@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'user', 'upload_type', 'file_size', 'uploaded_at']
    list_filter = ['upload_type', 'uploaded_at']
    search_fields = ['original_filename', 'user__full_name', 'user__email']

@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'amount', 'status', 'phone_number', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__full_name', 'user__email', 'mpesa_transaction_id']

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'wallet_type', 'created_at']
    list_filter = ['transaction_type', 'wallet_type', 'created_at']
    search_fields = ['user__full_name', 'user__email', 'description']

@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'wallet_type', 'status', 'requested_at', 'processed_at']
    list_filter = ['status', 'wallet_type', 'requested_at']
    search_fields = ['user__full_name', 'user__email']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'is_global', 'created_at']
    list_filter = ['notification_type', 'is_global', 'created_at']
    search_fields = ['title', 'message']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'subject', 'sent_at', 'is_read']
    list_filter = ['is_read', 'sent_at']
    search_fields = ['sender__full_name', 'recipient__full_name', 'content']