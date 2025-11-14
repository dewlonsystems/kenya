import os
from pathlib import Path
import json  # Add json import for parsing the environment variable
import firebase_admin
from firebase_admin import credentials, initialize_app  # Import initialize_app
from decouple import config
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Media files (for file uploads) - Define before re-defining BASE_DIR if it was used elsewhere initially
# (Though re-defining BASE_DIR later doesn't affect this assignment)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Re-defining BASE_DIR again (as it was done in the original code)
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = ['*']  # Update this for production

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'kenya',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'kenya.urls'
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kenya.wsgi.application'

# Database configuration for Supabase PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='postgres'),          # Database name
        'USER': config('DB_USER', default='postgres.vcxfstjnwuqdvbbsdqql'),  # Supabase user
        'PASSWORD': config('DB_PASSWORD', default='Deuk@2002'),     # Supabase password
        'HOST': config('DB_HOST', default='aws-1-eu-north-1.pooler.supabase.com'),
        'PORT': config('DB_PORT', cast=int, default=6543),
        # Optional: if using Supabase pooling
        'OPTIONS': {
            'options': '-c pool_mode=transaction'
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Updated Firebase configuration ---
FIREBASE_CREDENTIALS_JSON_STR = config('FIREBASE_CREDENTIALS_JSON', default=None)

if FIREBASE_CREDENTIALS_JSON_STR:
    try:
        # Parse the JSON string from the environment variable
        service_account_info = json.loads(FIREBASE_CREDENTIALS_JSON_STR)
        # Create credentials object from the dictionary
        cred = credentials.Certificate(service_account_info)
        # Initialize the app only if it hasn't been initialized yet
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully from environment variable.")
    except json.JSONDecodeError as e:
        print(f"Error decoding Firebase credentials JSON: {e}")
        raise
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        raise
else:
    print("Warning: FIREBASE_CREDENTIALS_JSON environment variable not set. Firebase Admin SDK will not be initialized.")
    # Optionally, you could handle a default case or raise an error if Firebase is essential
# --- End of Updated Firebase configuration ---

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# M-Pesa configuration
MPESA_CONSUMER_KEY = config('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET')
MPESA_SHORT_CODE = config('MPESA_SHORT_CODE')
MPESA_CALLBACK_URL = config('MPESA_CALLBACK_URL')

# Static files configuration (This section defines STATICFILES_DIRS)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files for uploads (if you plan to handle file uploads)
# (This section re-defines MEDIA_URL and MEDIA_ROOT, which were already set earlier)
# It's generally fine if they are the same, but defining them once is sufficient.
# If the earlier definition was correct, this part might be redundant.
# However, including it here maintains the structure from the original code if needed elsewhere.
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
