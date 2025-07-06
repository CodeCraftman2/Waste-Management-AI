// Google Translate Service - Direct Page Translation
class TranslateService {
  private currentLanguage: string = 'en';
  private isTranslating: boolean = false;
  private supportedLanguages = {
    'en': 'English',
    'es': 'Español', 
    'fr': 'Français',
    'de': 'Deutsch'
  };

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      // Initialize with saved language preference
      this.initializeLanguage();
    }
  }

  public changeLanguage(languageCode: string) {
    if (this.isTranslating) return; // Prevent concurrent translations
    
    console.log('Changing language to:', languageCode);
    this.currentLanguage = languageCode;
    
    // Store language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', languageCode);
    }
    
    // Apply translation to the page
    this.translatePage(languageCode);
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public getSupportedLanguages() {
    return this.supportedLanguages;
  }

  public initializeLanguage() {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && this.supportedLanguages[savedLanguage as keyof typeof this.supportedLanguages]) {
        this.currentLanguage = savedLanguage;
        // Apply saved language
        setTimeout(() => {
          this.translatePage(savedLanguage);
        }, 500);
      }
    }
  }

  private async translatePage(targetLanguage: string) {
    if (typeof window === 'undefined') return;
    if (this.isTranslating) return;
    
    this.isTranslating = true;
    
    try {
      if (targetLanguage === 'en') {
        // Reset to original English
        this.resetToOriginal();
        return;
      }

      console.log('Translating page to:', targetLanguage);
      
      // Get all text nodes in the page
      const textNodes = this.getTextNodes(document.body);
      console.log('Found text nodes:', textNodes.length);
      
      for (const node of textNodes) {
        if (node.textContent && node.textContent.trim()) {
          const originalText = node.textContent;
          const translatedText = await this.translateText(originalText, targetLanguage);
          if (translatedText && translatedText !== originalText) {
            // Mark as translated to avoid re-translation
            node.parentElement?.setAttribute('data-translated', 'true');
            node.textContent = translatedText;
          }
        }
      }

      // Also translate placeholder texts
      this.translatePlaceholders(targetLanguage);
      
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  private translatePlaceholders(targetLanguage: string) {
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(async (input) => {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) {
        const translatedPlaceholder = await this.translateText(placeholder, targetLanguage);
        if (translatedPlaceholder && translatedPlaceholder !== placeholder) {
          input.setAttribute('placeholder', translatedPlaceholder);
        }
      }
    });
  }

  private getTextNodes(element: Node): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip if text is empty or only whitespace
          if (!node.textContent || !node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip if parent has data-no-translate attribute
          if (parent && parent.hasAttribute('data-no-translate')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip if parent is already translated
          if (parent && parent.hasAttribute('data-translated')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    return textNodes;
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // Comprehensive translation mapping
    const translations: { [key: string]: { [key: string]: string } } = {
      'es': {
        'Settings': 'Configuración',
        'Profile': 'Perfil',
        'Notifications': 'Notificaciones',
        'Theme': 'Tema',
        'Language': 'Idioma',
        'Save Changes': 'Guardar Cambios',
        'Login': 'Iniciar Sesión',
        'Dashboard': 'Panel de Control',
        'Map': 'Mapa',
        'Report': 'Reportar',
        'Leaderboard': 'Clasificación',
        'Collect': 'Recolectar',
            'ScrapAI': 'ScrapAI',
    'By Y&D': 'Por Y&D',
        'Search': 'Buscar',
        'Sign Out': 'Cerrar Sesión',
        'Profile Settings': 'Configuración de Perfil',
        'Display Name': 'Nombre de Usuario',
        'Email': 'Correo Electrónico',
        'Bio': 'Biografía',
        'Location': 'Ubicación',
        'Privacy Settings': 'Configuración de Privacidad',
        'Public Profile': 'Perfil Público',
        'Show Location': 'Mostrar Ubicación',
        'Show Statistics': 'Mostrar Estadísticas',
        'Dark': 'Oscuro',
        'Light': 'Claro',
        'Auto': 'Automático',
        'Settings saved successfully!': '¡Configuración guardada exitosamente!',
        'Customize your ScrapAI experience': 'Personaliza tu experiencia de ScrapAI',
        'Receive notifications via email': 'Recibir notificaciones por correo electrónico',
        'Browser push notifications': 'Notificaciones push del navegador',
        'Notifications about your waste reports': 'Notificaciones sobre tus reportes de residuos',
        'New collection task alerts': 'Alertas de nuevas tareas de recolección',
        'Ranking and achievement updates': 'Actualizaciones de ranking y logros',
        'Make your profile visible to other users': 'Hacer tu perfil visible a otros usuarios',
        'Display your location on reports': 'Mostrar tu ubicación en los reportes',
        'Show your stats on leaderboard': 'Mostrar tus estadísticas en la clasificación',
        'Search...': 'Buscar...',
        'Fetch User Info': 'Obtener Información del Usuario',
        'Loading Web3Auth...': 'Cargando Web3Auth...',
        'Waste report submitted successfully! You earned 25 points.': '¡Reporte de residuos enviado exitosamente! Ganaste 25 puntos.',
        'Error submitting report. Please try again.': 'Error al enviar el reporte. Por favor, inténtalo de nuevo.',
        'Unable to get your location. Please enter it manually.': 'No se pudo obtener tu ubicación. Por favor, ingrésala manualmente.',
        'Welcome to ScrapAI': 'Bienvenido a ScrapAI',
        'Join the movement to create a cleaner, greener world. Report waste, collect rewards, and make a difference in your community.': 'Únete al movimiento para crear un mundo más limpio y verde. Reporta residuos, recolecta recompensas y marca la diferencia en tu comunidad.',
        'Quick Actions': 'Acciones Rápidas',
        'Your Impact': 'Tu Impacto',
        'Total Reports': 'Reportes Totales',
        'Points Earned': 'Puntos Ganados',
        'Collections': 'Recolecciones',
        'Community Rank': 'Rango Comunitario',
        'Environmental Impact': 'Impacto Ambiental',
        'CO₂ Saved': 'CO₂ Ahorrado',
        'This month': 'Este mes',
        'Waste Diverted': 'Residuos Desviados',
        'From landfills': 'De vertederos',
        'Trees Saved': 'Árboles Salvados',
        'Equivalent': 'Equivalente',
        'Community Impact': 'Impacto Comunitario',
        'Together, we\'re making a difference': 'Juntos, estamos marcando la diferencia',
        'Active Users': 'Usuarios Activos'
      },
      'fr': {
        'Settings': 'Paramètres',
        'Profile': 'Profil',
        'Notifications': 'Notifications',
        'Theme': 'Thème',
        'Language': 'Langue',
        'Save Changes': 'Enregistrer les Modifications',
        'Login': 'Connexion',
        'Dashboard': 'Tableau de Bord',
        'Map': 'Carte',
        'Report': 'Signaler',
        'Leaderboard': 'Classement',
        'Collect': 'Collecter',
        'ScrapAI': 'ScrapAI',
        'By Y&D': 'Par Y&D',
        'Search': 'Rechercher',
        'Sign Out': 'Déconnexion',
        'Profile Settings': 'Paramètres de Profil',
        'Display Name': 'Nom d\'Affichage',
        'Email': 'E-mail',
        'Bio': 'Biographie',
        'Location': 'Emplacement',
        'Privacy Settings': 'Paramètres de Confidentialité',
        'Public Profile': 'Profil Public',
        'Show Location': 'Afficher l\'Emplacement',
        'Show Statistics': 'Afficher les Statistiques',
        'Dark': 'Sombre',
        'Light': 'Clair',
        'Auto': 'Automatique',
        'Settings saved successfully!': 'Paramètres enregistrés avec succès !',
        'Customize your ScrapAI experience': 'Personnalisez votre expérience ScrapAI',
        'Receive notifications via email': 'Recevoir des notifications par e-mail',
        'Browser push notifications': 'Notifications push du navigateur',
        'Notifications about your waste reports': 'Notifications sur vos rapports de déchets',
        'New collection task alerts': 'Alertes de nouvelles tâches de collecte',
        'Ranking and achievement updates': 'Mises à jour de classement et de réalisations',
        'Make your profile visible to other users': 'Rendre votre profil visible aux autres utilisateurs',
        'Display your location on reports': 'Afficher votre emplacement sur les rapports',
        'Show your stats on leaderboard': 'Afficher vos statistiques sur le classement',
        'Search...': 'Rechercher...',
        'Fetch User Info': 'Récupérer les Informations Utilisateur',
        'Loading Web3Auth...': 'Chargement de Web3Auth...',
        'Waste report submitted successfully! You earned 25 points.': 'Rapport de déchets soumis avec succès ! Vous avez gagné 25 points.',
        'Error submitting report. Please try again.': 'Erreur lors de la soumission du rapport. Veuillez réessayer.',
        'Unable to get your location. Please enter it manually.': 'Impossible d\'obtenir votre emplacement. Veuillez l\'entrer manuellement.',
        'Welcome to ScrapAI': 'Bienvenue à ScrapAI',
        'Join the movement to create a cleaner, greener world. Report waste, collect rewards, and make a difference in your community.': 'Rejoignez le mouvement pour créer un monde plus propre et plus vert. Signalez les déchets, collectez des récompenses et faites une différence dans votre communauté.',
        'Quick Actions': 'Actions Rapides',
        'Your Impact': 'Votre Impact',
        'Total Reports': 'Rapports Totaux',
        'Points Earned': 'Points Gagnés',
        'Collections': 'Collectes',
        'Community Rank': 'Rang Communautaire',
        'Environmental Impact': 'Impact Environnemental',
        'CO₂ Saved': 'CO₂ Économisé',
        'This month': 'Ce mois-ci',
        'Waste Diverted': 'Déchets Détournés',
        'From landfills': 'Des décharges',
        'Trees Saved': 'Arbres Sauvés',
        'Equivalent': 'Équivalent',
        'Community Impact': 'Impact Communautaire',
        'Together, we\'re making a difference': 'Ensemble, nous faisons une différence',
        'Active Users': 'Utilisateurs Actifs'
      },
      'de': {
        'Settings': 'Einstellungen',
        'Profile': 'Profil',
        'Notifications': 'Benachrichtigungen',
        'Theme': 'Design',
        'Language': 'Sprache',
        'Save Changes': 'Änderungen Speichern',
        'Login': 'Anmelden',
        'Dashboard': 'Dashboard',
        'Map': 'Karte',
        'Report': 'Melden',
        'Leaderboard': 'Rangliste',
        'Collect': 'Sammeln',
        'ScrapAI': 'ScrapAI',
        'By Y&D': 'Von Y&D',
        'Search': 'Suchen',
        'Sign Out': 'Abmelden',
        'Profile Settings': 'Profileinstellungen',
        'Display Name': 'Anzeigename',
        'Email': 'E-Mail',
        'Bio': 'Biografie',
        'Location': 'Standort',
        'Privacy Settings': 'Datenschutzeinstellungen',
        'Public Profile': 'Öffentliches Profil',
        'Show Location': 'Standort Anzeigen',
        'Show Statistics': 'Statistiken Anzeigen',
        'Dark': 'Dunkel',
        'Light': 'Hell',
        'Auto': 'Automatisch',
        'Settings saved successfully!': 'Einstellungen erfolgreich gespeichert!',
        'Customize your ScrapAI experience': 'Passen Sie Ihre ScrapAI-Erfahrung an',
        'Receive notifications via email': 'Benachrichtigungen per E-Mail erhalten',
        'Browser push notifications': 'Browser-Push-Benachrichtigungen',
        'Notifications about your waste reports': 'Benachrichtigungen zu Ihren Abfallberichten',
        'New collection task alerts': 'Warnungen für neue Sammelaufgaben',
        'Ranking and achievement updates': 'Ranglisten- und Erfolgs-Updates',
        'Make your profile visible to other users': 'Machen Sie Ihr Profil für andere Benutzer sichtbar',
        'Display your location on reports': 'Zeigen Sie Ihren Standort in Berichten an',
        'Show your stats on leaderboard': 'Zeigen Sie Ihre Statistiken in der Rangliste an',
        'Search...': 'Suchen...',
        'Fetch User Info': 'Benutzerinformationen Abrufen',
        'Loading Web3Auth...': 'Web3Auth wird geladen...',
        'Waste report submitted successfully! You earned 25 points.': 'Abfallbericht erfolgreich eingereicht! Sie haben 25 Punkte verdient.',
        'Error submitting report. Please try again.': 'Fehler beim Einreichen des Berichts. Bitte versuchen Sie es erneut.',
        'Unable to get your location. Please enter it manually.': 'Standort konnte nicht ermittelt werden. Bitte geben Sie ihn manuell ein.',
        'Welcome to ScrapAI': 'Willkommen bei ScrapAI',
        'Join the movement to create a cleaner, greener world. Report waste, collect rewards, and make a difference in your community.': 'Schließen Sie sich der Bewegung an, um eine sauberere, grünere Welt zu schaffen. Melden Sie Abfall, sammeln Sie Belohnungen und machen Sie einen Unterschied in Ihrer Gemeinde.',
        'Quick Actions': 'Schnellaktionen',
        'Your Impact': 'Ihr Impact',
        'Total Reports': 'Gesamtberichte',
        'Points Earned': 'Verdiente Punkte',
        'Collections': 'Sammlungen',
        'Community Rank': 'Gemeinschaftsrang',
        'Environmental Impact': 'Umweltauswirkungen',
        'CO₂ Saved': 'CO₂ Gespart',
        'This month': 'Diesen Monat',
        'Waste Diverted': 'Abfall Umgeleitet',
        'From landfills': 'Von Deponien',
        'Trees Saved': 'Bäume Gerettet',
        'Equivalent': 'Äquivalent',
        'Community Impact': 'Gemeinschaftsimpact',
        'Together, we\'re making a difference': 'Gemeinsam machen wir einen Unterschied',
        'Active Users': 'Aktive Benutzer'
      }
    };

    const langTranslations = translations[targetLanguage];
    if (langTranslations && langTranslations[text]) {
      return langTranslations[text];
    }

    // If no direct translation found, return original text
    return text;
  }

  private resetToOriginal() {
    // Don't reload, just clear any translations
    if (typeof window === 'undefined') return;
    
    // Clear any translation-related classes or attributes
    const translatedElements = document.querySelectorAll('[data-translated]');
    translatedElements.forEach(element => {
      element.removeAttribute('data-translated');
    });
  }
}

export const translateService = new TranslateService(); 