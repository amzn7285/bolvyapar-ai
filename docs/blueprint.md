# **App Name**: DukaanSaathi AI (दुकान साथी)

## Core Features:

- Secure Multi-language Access: PIN-protected login with owner/helper roles, multi-language selection (Hindi, English) on a lock screen, and persistence of language choice via localStorage for a voice-first experience. Helper PINs restrict access to sensitive data and sections.
- Voice-First AI Business Partner: Utilizes the browser's Web Speech API for input and SpeechSynthesis for output. Employs a Gemini AI tool to process spoken Hindi/Hinglish/English commands for transaction parsing (product, quantity, price, customer), providing warm, concise voice confirmations and silently generating passive business lesson text.
- Real-time Sales & Stock Display: Presents 'Today's Sales' with transaction counts and dynamically colored stock cards (Grains, Dairy, Essentials) showing quantities and status (good, low, critical). Includes audible stock status upon user request.
- Adaptive Privacy & Customer Views: Offers three modes: Normal, Private (instantly blurs all financial numbers, silences AI voice for numbers, shows 'Private Mode ON' banner), and Customer View (full-screen display of current item and price).
- Progressive Learning ('Seekha Hua'): Displays progressively unlocked 'Seekha Hua' lesson cards, offering visual learning (large emojis, keywords) with an audible explanation (via a 'Suno' button) and AI-explained context (via 'AI ne kya kiya?' button), promoting passive business learning.
- Owner Analytics & Reporting: A PIN-protected 'Report' tab (requiring re-entry) provides owners with weekly sales data (blurred in Private Mode), best product/margin insights, AI-discovered customer/sales patterns, a future tip, WhatsApp summary (no financials), and a PIN-confirmed data export function.
- Firestore Data Management: Persists all application data, including stock, transactions, PIN hashes, and user settings, using Firestore under a unique device/user ID. Supports initial pre-loaded sample data and provides an explicit toggle for optional cloud synchronization.

## Style Guidelines:

- Primary accent color: Saffron orange (#C45000), vibrant and warm, used for prominent interactive elements and calls to action.
- Secondary accent color: Deep green (#1A6B3C), symbolizing growth and prosperity, used for positive indicators and informational elements.
- Main background and header color: Deep Navy (#0D2240), providing a trusted, modern, and dark base for the interface that reduces eye strain.
- Neutral text and subtle details: Light grey tones for general information, ensuring high contrast against the dark background.
- Overall font: 'PT Sans' (sans-serif), chosen for its legibility, modern yet warm feel, making it suitable for both large numbers and smaller descriptive text while maintaining a friendly persona.
- Use clear, prominent, and culturally relevant icons and emojis that effectively convey meaning without heavy reliance on text, dominating the visual hierarchy to support the voice-first experience.
- Mobile-first, clean, and intuitive design with generous spacing. Interactive elements have a minimum touch target height of 64px, and numerical displays are a minimum of 32px font size to ensure high accessibility and ease of use for diverse users.
- Subtle and purposeful animations provide smooth transitions, feedback for voice interactions (e.g., microphone activation pulse), and state changes (e.g., privacy mode toggles), contributing to a responsive and friendly user experience without distraction.