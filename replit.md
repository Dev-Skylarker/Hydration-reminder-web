# AquaFlow - Hydration Tracker

## Overview

AquaFlow is a gamified hydration tracking web application built with pure HTML, CSS, and JavaScript. The app encourages users to maintain healthy hydration habits through personalized tracking, notifications, achievements, and engaging visual design. It features a multi-page single-page application (SPA) architecture with local storage for data persistence.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Multi-page navigation handled entirely through JavaScript without page reloads
- **Vanilla JavaScript**: No frameworks or libraries used, pure JavaScript for all functionality
- **CSS-only Styling**: Modern glass-morphism design with neon effects and animations
- **Responsive Design**: Mobile-first approach with responsive layouts

### Data Storage
- **Local Storage**: Browser's localStorage API for data persistence
- **No Backend**: Entirely client-side application with no server dependencies
- **Data Structure**: JSON objects stored for user preferences, progress tracking, and achievement states

## Key Components

### 1. User Interface Components
- **Navigation System**: Tab-based navigation between Home, Tracker, Stats, and About pages
- **Hero Section**: Animated welcome screen with floating elements
- **Glass Cards**: Modern glass-morphism UI components for data display
- **Progress Indicators**: Visual progress bars and circular progress displays

### 2. Core Tracking System
- **HydrationTracker Class**: Main application controller managing all functionality
- **Daily Goal Logic**: 8-9 glasses per day target with smart progress tracking
- **Streak System**: Consecutive day tracking for user motivation
- **Achievement System**: Unlockable badges for various milestones

### 3. Notification System
- **Browser Push Notifications**: Web notification API for hydration reminders
- **Permission Management**: Graceful handling of notification permissions
- **Reminder Intervals**: Configurable reminder scheduling

### 4. Gamification Features
- **Level System**: 5-tier progression from "Thirsty Noob" to "Aqua God"
- **Achievements**: 6 different achievement categories with visual feedback
- **Fun Facts**: Rotating educational content about hydration benefits

## Data Flow

### 1. Initialization
1. Load user data from localStorage
2. Initialize UI components and event listeners
3. Request notification permissions
4. Display current hydration status

### 2. User Interaction Flow
1. **First Visit**: Name entry and welcome onboarding
2. **Daily Tracking**: Add glasses through intuitive UI controls
3. **Progress Updates**: Real-time updates to progress indicators and statistics
4. **Achievement Unlocking**: Automatic achievement checking and celebration

### 3. Data Persistence
```javascript
userData = {
    name: string,
    glassesDrankToday: number,
    lastDrinkDate: string,
    hydrationStreak: number,
    totalGlassesDrank: number,
    achievements: array,
    level: object
}
```

## External Dependencies

### Browser APIs
- **Local Storage API**: Data persistence
- **Notification API**: Push notifications for reminders
- **Vibration API**: Mobile haptic feedback (optional)
- **Date API**: Time-based logic for daily resets

### No External Libraries
- Pure vanilla JavaScript implementation
- CSS-only animations and styling
- Self-contained HTML structure

## Deployment Strategy

### Static Hosting
- **Python HTTP Server**: Development server using `python -m http.server 5000`
- **Static File Serving**: No build process required
- **Progressive Web App Ready**: Manifest file included for PWA capabilities

### Browser Compatibility
- Modern browsers with ES6+ support
- Local storage support required
- Notification API support (graceful degradation)

### Performance Considerations
- Minimal JavaScript bundle size
- CSS animations for smooth performance
- Local data storage eliminates network requests

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.