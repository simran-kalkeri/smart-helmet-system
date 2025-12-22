# 🛡️ Smart Helmet Dashboard

A comprehensive IoT dashboard for real-time smart helmet monitoring and accident detection system. Built with Next.js, React, and modern web technologies.

![Smart Helmet Dashboard](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🌟 Features

### 🚨 Accident Detection & SOS System
- **10-Second SOS Cancel Timer**: Allows riders to cancel false alarms within 10 seconds
- **Severity Levels**: 
  - **High Severity**: No response within 10 seconds - automatic emergency notification
  - **Low Severity**: User cancels SOS - marked as false alarm
- **Automatic Emergency Alerts**: High severity accidents trigger automatic SOS to emergency contacts

### 📧 Email Notification System
- Real-time email alerts to emergency contacts
- Detailed accident telemetry including:
  - Gyroscope data (angular velocity in °/s)
  - Accelerometer data (G-force measurements)
  - GPS coordinates with Google Maps link
  - Impact force and helmet tilt angle
  - Timestamp and severity level
- Different email templates for high/low severity accidents

### 🗺️ Real-Time GPS Tracking
- Live location tracking using browser Geolocation API
- Simulated movement within 10m radius for demonstration
- Movement halts automatically when accident is detected
- Interactive map with accident location markers

### 📊 Dynamic Safety Score
- Calculated based on accident history
- Formula: Base score (100) - (High severity × 10) - (Low severity × 5)
- Rating scale: Excellent (90-100), Good (70-89), Fair (50-69), Poor (0-49)

### ⏰ 24-Hour Alert Auto-Deactivation
- Alerts automatically deactivate after 24 hours
- Dashboard shows only active alerts
- Full history maintained in "My Alerts" page
- Filter options: Active, Deactivated, High Severity, Low Severity

### 📱 Notification Channels
- **Email**: ✅ Configured and active
- **SMS**: ❌ Not configured
- **Telegram**: ❌ Not configured
- Clear status indicators for each channel

### 🎨 Modern UI/UX
- Beautiful, responsive dashboard design
- Colorful animated sidebar with unique icons
- Dark/Light theme support
- Real-time data visualization
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/simran-kalkeri/smart-helmet-dashboard.git
   cd smart-helmet-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **To get Gmail App Password:**
   - Go to Google Account Settings → Security
   - Enable 2-Factor Authentication
   - Go to App Passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password to `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
smart-helmet-dashboard/
├── app/
│   ├── (dashboard)/          # Dashboard pages
│   │   ├── page.tsx          # Main dashboard
│   │   ├── alerts/           # My Alerts page
│   │   ├── history/          # Event History page
│   │   ├── notifications/    # Notifications page
│   │   ├── map/              # Live Map page
│   │   ├── profile/          # User Profile page
│   │   └── settings/         # Settings page
│   ├── api/                  # API routes
│   │   ├── alerts/           # Alerts API
│   │   ├── history/          # History API
│   │   ├── notifications/    # Notifications API
│   │   └── simulate-accident/ # Accident simulation API
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Header.tsx            # Page header
│   ├── Map.tsx               # Interactive map
│   ├── AlertCard.tsx         # Alert display card
│   ├── HelmetStatus.tsx      # Helmet status widget
│   └── SOSCancelModal.tsx    # SOS cancel countdown modal
├── context/
│   ├── AccidentContext.tsx   # Accident state management
│   └── ThemeContext.tsx      # Theme management
├── lib/
│   ├── accidents-store.ts    # In-memory accident storage
│   └── data.ts               # Mock data
└── public/                   # Static assets
```

## 🎯 How to Use

### Simulating an Accident

1. Go to the **Dashboard** page
2. Click the **"Simulate Accident"** button
3. A 10-second countdown modal will appear
4. **Options:**
   - **Cancel within 10 seconds**: Marks as low severity (false alarm)
   - **Let timer expire**: Marks as high severity (emergency)
5. Email notification is sent to emergency contacts
6. Accident appears in Alerts, History, and Notifications pages

### Viewing Alerts

1. Navigate to **"My Alerts"** page
2. Use filters to view:
   - All Alerts
   - Active Only (< 24 hours)
   - Deactivated (> 24 hours)
   - High Severity
   - False Alarms / Low Severity
3. For active alerts:
   - Click **"Locate"** to open Google Maps with exact coordinates
   - High severity shows "Emergency SOS Sent Automatically"
   - Low severity has manual "Emergency SOS" button

### Checking Safety Score

- View on the main **Dashboard**
- Score updates automatically based on accident history
- Rating displayed: Excellent, Good, Fair, or Poor

## 🔧 Configuration

### Email Settings

Edit `.env.local`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Notification Recipients

Edit `app/api/simulate-accident/route.ts`:
```typescript
to: "recipient@example.com"  // Line 79
```

### Alert Auto-Deactivation Time

Edit `lib/accidents-store.ts`:
```typescript
const isActive = hoursSinceAccident < 24;  // Change 24 to desired hours
```

## 📊 Sensor Data

The system simulates realistic sensor telemetry:

### Gyroscope (Angular Velocity)
- **High Severity**: 245°/s (pitch), 189°/s (roll), 156°/s (yaw)
- **Low Severity**: 45°/s (pitch), 32°/s (roll), 28°/s (yaw)

### Accelerometer (G-Force)
- **High Severity**: 8.5G (X), 6.2G (Y), 12.3G (Z)
- **Low Severity**: 2.1G (X), 1.8G (Y), 3.2G (Z)

### Calculated Values
- **Tilt Angle**: Derived from gyroscope data
- **Impact Force**: Total acceleration magnitude

## 🛠️ Technologies Used

- **Framework**: Next.js 16.0.7 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: CSS Modules, Styled JSX
- **Maps**: React Leaflet
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Email**: Nodemailer
- **State Management**: React Context API

## 📝 API Endpoints

- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/active-count` - Get active alerts count
- `GET /api/history` - Get event history
- `GET /api/notifications` - Get notifications
- `POST /api/simulate-accident` - Simulate accident (with location & severity)

## 🎨 Theme Support

The dashboard supports both dark and light themes:
- Toggle in the header
- Persists across sessions
- Smooth theme transitions

## 🔒 Security Notes

- Email credentials stored in `.env.local` (not committed to Git)
- Use Gmail App Passwords (not your actual password)
- In-memory storage (data resets on server restart)
- For production: Implement database and proper authentication

## 🚧 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] SMS and Telegram notification integration
- [ ] Real hardware sensor integration
- [ ] WebSocket for real-time updates
- [ ] Mobile app companion
- [ ] Multi-user support
- [ ] Data analytics and reporting

## 📄 License

This project is created for educational purposes as part of an IoT course project.

## 👤 Author

**Simran Kalkeri**
- GitHub: [@simran-kalkeri](https://github.com/simran-kalkeri)

## 🙏 Acknowledgments

- Built with Next.js and React
- Icons by Lucide
- Maps by Leaflet
- Email service by Nodemailer

---

**Made with ❤️ for Smart Helmet Safety System**
