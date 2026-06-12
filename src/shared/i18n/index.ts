import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        language: 'Language',
        languages: {
          en: 'English',
          es: 'Spanish',
          ru: 'Russian',
        },
        backToSignIn: 'Back to sign in',
        retry: 'Retry',
      },
      auth: {
        welcome: {
          title: 'Welcome',
          description: 'Continue in Java authentication flow.',
        },
        fields: {
          email: 'Email',
          password: 'Password',
          firstName: 'First name',
          lastName: 'Last name',
          birthDate: 'Birth date',
          phone: 'Phone',
          accountEmail: 'Account email',
        },
        signIn: {
          title: 'Sign in',
          description:
            'Enter your credentials to start the PKCE authorization flow.',
          submit: 'Sign in',
          submitting: 'Signing in...',
          continueSession: 'Continue with existing session',
          noAccount: "Don't have an account?",
          signUp: 'Sign up',
          resetPassword: 'Reset password',
          registrationSuccess: 'Account created successfully. Please sign in.',
          unexpectedError: 'Unexpected authentication error.',
        },
        signUp: {
          title: 'Create account',
          description:
            'Register your account and then continue with PKCE sign-in.',
          submit: 'Create account',
          submitting: 'Creating account...',
          haveAccount: 'Already have an account?',
          signIn: 'Sign in',
          invalidEmail: 'Please use a valid email address.',
          failure: 'Could not sign up. Please try again.',
          passwordHint: 'At least 8 characters',
          optionalPhone: 'Optional',
        },
        resetPassword: {
          title: 'Reset password',
          description:
            'Submit your account email and we will trigger a reset request.',
          submit: 'Send reset link',
          submitting: 'Submitting...',
          rememberedPassword: 'Remembered your password?',
          ifExists: 'If your account exists, reset instructions were sent.',
          endpointUnavailable:
            'Reset endpoint is not available yet, but the screen is wired and ready.',
          failure: 'Could not request password reset.',
        },
      },
      pkce: {
        redirectingTitle: 'Redirecting to authorization',
        preparing: 'Preparing PKCE challenge...',
        failedTitle: 'PKCE start failed',
        retry: 'Retry',
      },
      callback: {
        signingInTitle: 'Signing you in',
        validating:
          'Validating authorization code and creating your session...',
        failedTitle: 'Authentication failed',
        retryFlow: 'Retry PKCE flow',
      },
      verifyEmail: {
        verifyingTitle: 'Verifying your email',
        verifyingDescription: 'Checking verification token...',
        successTitle: 'Email verified',
        successDescription:
          'Your email has been confirmed. You can sign in now.',
        failedTitle: 'Email verification failed',
        failedMessage: 'Could not verify your email. Please try again later.',
        expiredTitle: 'Verification link expired',
        expiredMessage:
          'This verification token has expired. Request a new email verification link.',
        missingToken: 'Verification token is missing in URL.',
      },
      gallery: {
        title: 'Gallery',
        description:
          'Protected page available only after successful PKCE authentication.',
        galleryTab: 'Gallery',
        blogTab: 'Blog',
        blogPlaceholder: 'Blog feed will appear here.',
        signOut: 'Sign out',
        signingOut: 'Signing out...',
        accessToken: 'Access token',
        tokenNotAvailable: 'n/a',
        logoutFailed: 'Logout failed.',
        imageUpload: {
          title: 'Upload image',
          description:
            'Add an image to the admin gallery and wait for backend processing.',
          choose: 'Choose image',
          hint: 'PNG, JPG, GIF, or any supported image file',
          selected: 'Selected image',
          clear: 'Clear selected image',
          upload: 'Upload',
          uploading: 'Uploading...',
          processing: 'Processing image...',
          creating: 'Creating image...',
          success: 'Image uploaded successfully.',
          failed: 'Image upload failed.',
          invalid: 'File upload has failed. Please choose another image.',
          timeout: 'Image processing timed out. Please try again.',
          unexpectedStatus: 'Image processing returned an unexpected status.',
          emptyError: 'Choose an image to upload.',
        },
      },
    },
  },
  es: {
    translation: {
      common: {
        language: 'Idioma',
        languages: {
          en: 'Ingles',
          es: 'Espanol',
          ru: 'Ruso',
        },
        backToSignIn: 'Volver a iniciar sesion',
        retry: 'Reintentar',
      },
      auth: {
        welcome: {
          title: 'Bienvenido',
          description: 'Continua en el flujo de autenticacion de Java.',
        },
        fields: {
          email: 'Correo',
          password: 'Contrasena',
          firstName: 'Nombre',
          lastName: 'Apellido',
          birthDate: 'Fecha de nacimiento',
          phone: 'Telefono',
          accountEmail: 'Correo de la cuenta',
        },
        signIn: {
          title: 'Iniciar sesion',
          description: 'Introduce tus credenciales para iniciar el flujo PKCE.',
          submit: 'Entrar',
          submitting: 'Iniciando sesion...',
          continueSession: 'Continuar con sesion existente',
          noAccount: 'No tienes cuenta?',
          signUp: 'Registrate',
          resetPassword: 'Restablecer contrasena',
          registrationSuccess: 'Cuenta creada correctamente. Inicia sesion.',
          unexpectedError: 'Error de autenticacion inesperado.',
        },
        signUp: {
          title: 'Crear cuenta',
          description: 'Registra tu cuenta y despues continua con PKCE.',
          submit: 'Crear cuenta',
          submitting: 'Creando cuenta...',
          haveAccount: 'Ya tienes cuenta?',
          signIn: 'Iniciar sesion',
          invalidEmail: 'Usa un correo valido.',
          failure: 'No se pudo registrar. Intentalo de nuevo.',
          passwordHint: 'Al menos 8 caracteres',
          optionalPhone: 'Opcional',
        },
        resetPassword: {
          title: 'Restablecer contrasena',
          description:
            'Envia el correo de tu cuenta para solicitar el restablecimiento.',
          submit: 'Enviar enlace',
          submitting: 'Enviando...',
          rememberedPassword: 'Recordaste tu contrasena?',
          ifExists: 'Si la cuenta existe, enviamos instrucciones.',
          endpointUnavailable:
            'El endpoint de reset no esta disponible aun, pero la pantalla esta lista.',
          failure: 'No se pudo solicitar el restablecimiento.',
        },
      },
      pkce: {
        redirectingTitle: 'Redirigiendo a autorizacion',
        preparing: 'Preparando PKCE...',
        failedTitle: 'Fallo al iniciar PKCE',
        retry: 'Reintentar',
      },
      callback: {
        signingInTitle: 'Iniciando tu sesion',
        validating: 'Validando codigo de autorizacion y creando sesion...',
        failedTitle: 'Autenticacion fallida',
        retryFlow: 'Reintentar flujo PKCE',
      },
      verifyEmail: {
        verifyingTitle: 'Verificando tu correo',
        verifyingDescription: 'Comprobando token de verificacion...',
        successTitle: 'Correo verificado',
        successDescription: 'Tu correo ya esta confirmado. Ya puedes iniciar sesion.',
        failedTitle: 'Fallo la verificacion de correo',
        failedMessage:
          'No se pudo verificar tu correo. Intentalo de nuevo mas tarde.',
        expiredTitle: 'Enlace de verificacion vencido',
        expiredMessage:
          'Este token de verificacion vencio. Solicita un nuevo enlace.',
        missingToken: 'Falta el token de verificacion en la URL.',
      },
      gallery: {
        title: 'Galeria',
        description:
          'Pagina protegida disponible solo tras autenticacion PKCE.',
        galleryTab: 'Galeria',
        blogTab: 'Blog',
        blogPlaceholder: 'La lista del blog aparecera aqui.',
        signOut: 'Cerrar sesion',
        signingOut: 'Cerrando sesion...',
        accessToken: 'Token de acceso',
        tokenNotAvailable: 'n/d',
        logoutFailed: 'Fallo al cerrar sesion.',
        imageUpload: {
          title: 'Subir imagen',
          description:
            'Agrega una imagen a la galeria de administracion y espera el procesamiento del backend.',
          choose: 'Elegir imagen',
          hint: 'PNG, JPG, GIF o cualquier imagen compatible',
          selected: 'Imagen seleccionada',
          clear: 'Limpiar imagen seleccionada',
          upload: 'Subir',
          uploading: 'Subiendo...',
          processing: 'Procesando imagen...',
          creating: 'Creando imagen...',
          success: 'Imagen subida correctamente.',
          failed: 'Fallo al subir la imagen.',
          invalid: 'La carga del archivo fallo. Elige otra imagen.',
          timeout: 'El procesamiento de la imagen agoto el tiempo. Intentalo de nuevo.',
          unexpectedStatus:
            'El procesamiento de la imagen devolvio un estado inesperado.',
          emptyError: 'Elige una imagen para subir.',
        },
      },
    },
  },
  ru: {
    translation: {
      common: {
        language: 'Язык',
        languages: {
          en: 'Английский',
          es: 'Испанский',
          ru: 'Русский',
        },
        backToSignIn: 'Назад ко входу',
        retry: 'Повторить',
      },
      auth: {
        welcome: {
          title: 'Добро пожаловать',
          description: 'Продолжите во внешнем Java-потоке авторизации.',
        },
        fields: {
          email: 'Email',
          password: 'Пароль',
          firstName: 'Имя',
          lastName: 'Фамилия',
          birthDate: 'Дата рождения',
          phone: 'Телефон',
          accountEmail: 'Email аккаунта',
        },
        signIn: {
          title: 'Вход',
          description: 'Введите данные, чтобы начать PKCE авторизацию.',
          submit: 'Войти',
          submitting: 'Вход...',
          continueSession: 'Продолжить с текущей сессией',
          noAccount: 'Нет аккаунта?',
          signUp: 'Регистрация',
          resetPassword: 'Сбросить пароль',
          registrationSuccess: 'Аккаунт создан. Войдите в систему.',
          unexpectedError: 'Неожиданная ошибка авторизации.',
        },
        signUp: {
          title: 'Регистрация',
          description: 'Создайте аккаунт, затем продолжите PKCE вход.',
          submit: 'Создать аккаунт',
          submitting: 'Создание аккаунта...',
          haveAccount: 'Уже есть аккаунт?',
          signIn: 'Вход',
          invalidEmail: 'Укажите корректный email.',
          failure: 'Не удалось зарегистрироваться. Повторите попытку.',
          passwordHint: 'Минимум 8 символов',
          optionalPhone: 'Необязательно',
        },
        resetPassword: {
          title: 'Сброс пароля',
          description: 'Отправьте email аккаунта для запроса сброса.',
          submit: 'Отправить ссылку',
          submitting: 'Отправка...',
          rememberedPassword: 'Вспомнили пароль?',
          ifExists: 'Если аккаунт существует, инструкция отправлена.',
          endpointUnavailable:
            'Эндпоинт сброса пока недоступен, но экран уже готов.',
          failure: 'Не удалось запросить сброс пароля.',
        },
      },
      pkce: {
        redirectingTitle: 'Переадресация на авторизацию',
        preparing: 'Подготовка PKCE...',
        failedTitle: 'Не удалось запустить PKCE',
        retry: 'Повторить',
      },
      callback: {
        signingInTitle: 'Выполняем вход',
        validating: 'Проверяем код и создаем сессию...',
        failedTitle: 'Ошибка авторизации',
        retryFlow: 'Повторить PKCE',
      },
      verifyEmail: {
        verifyingTitle: 'Подтверждаем email',
        verifyingDescription: 'Проверяем токен подтверждения...',
        successTitle: 'Email подтвержден',
        successDescription:
          'Ваш email успешно подтвержден. Теперь можно войти.',
        failedTitle: 'Не удалось подтвердить email',
        failedMessage:
          'Не удалось подтвердить email. Попробуйте снова позже.',
        expiredTitle: 'Ссылка подтверждения истекла',
        expiredMessage:
          'Срок действия этого токена истек. Запросите новую ссылку подтверждения.',
        missingToken: 'В URL отсутствует токен подтверждения.',
      },
      gallery: {
        title: 'Галерея',
        description:
          'Защищенная страница доступна после успешной PKCE авторизации.',
        galleryTab: 'Галерея',
        blogTab: 'Блог',
        blogPlaceholder: 'Лента блога появится здесь.',
        signOut: 'Выйти',
        signingOut: 'Выход...',
        accessToken: 'Access token',
        tokenNotAvailable: 'н/д',
        logoutFailed: 'Не удалось выйти.',
        imageUpload: {
          title: 'Загрузить изображение',
          description:
            'Добавьте изображение в админ-галерею и дождитесь обработки на сервере.',
          choose: 'Выбрать изображение',
          hint: 'PNG, JPG, GIF или любой поддерживаемый файл изображения',
          selected: 'Выбранное изображение',
          clear: 'Очистить выбранное изображение',
          upload: 'Загрузить',
          uploading: 'Загрузка...',
          processing: 'Обработка изображения...',
          creating: 'Создание изображения...',
          success: 'Изображение успешно загружено.',
          failed: 'Не удалось загрузить изображение.',
          invalid: 'Загрузка файла не удалась. Выберите другое изображение.',
          timeout:
            'Время ожидания обработки изображения истекло. Попробуйте снова.',
          unexpectedStatus:
            'Обработка изображения вернула неожиданный статус.',
          emptyError: 'Выберите изображение для загрузки.',
        },
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_lang',
    },
  })
  .catch((error) => {
    console.error('Failed to initialize i18n', error);
  });

export default i18n;
