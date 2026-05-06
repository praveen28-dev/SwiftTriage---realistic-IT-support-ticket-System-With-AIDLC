# SwiftTriage Analytics & Tracking Setup Guide

**Date**: May 5, 2026  
**Version**: 1.0  
**Status**: ✅ Implemented

---

## Overview

This guide provides complete instructions for setting up Google Analytics 4, Google Search Console, and event tracking for SwiftTriage.

---

## 1. Google Analytics 4 Setup

### ✅ Already Implemented

The following files have been created and configured:

1. **`lib/analytics.ts`** - Analytics utility functions
2. **`app/components/analytics/GoogleAnalytics.tsx`** - Page view tracking component
3. **`app/layout.tsx`** - GA4 script integration
4. **`app/providers.tsx`** - GoogleAnalytics component integration
5. **`.env.local.example`** - Environment variable template

### 🚀 Step-by-Step Setup

#### Step 1: Create Google Analytics 4 Property

1. **Go to Google Analytics**
   - Visit [https://analytics.google.com/](https://analytics.google.com/)
   - Sign in with your Google account

2. **Create Account** (if you don't have one)
   - Click "Start measuring"
   - Enter account name: "SwiftTriage"
   - Configure data sharing settings
   - Click "Next"

3. **Create Property**
   - Property name: "SwiftTriage Production"
   - Time zone: Select your timezone
   - Currency: Select your currency
   - Click "Next"

4. **Business Information**
   - Industry: "Technology" or "Software"
   - Business size: Select appropriate size
   - How you plan to use Analytics: Select all that apply
   - Click "Create"

5. **Accept Terms of Service**
   - Read and accept the terms
   - Click "I Accept"

6. **Set Up Data Stream**
   - Platform: "Web"
   - Website URL: `https://swifttriage.com`
   - Stream name: "SwiftTriage Website"
   - Click "Create stream"

7. **Get Measurement ID**
   - Copy the Measurement ID (format: `G-XXXXXXXXXX`)
   - You'll need this for the next step

#### Step 2: Configure Environment Variable

1. **Open `.env.local` file** (create if it doesn't exist)
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Measurement ID**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID

3. **Restart development server**
   ```bash
   npm run dev
   ```

#### Step 3: Verify Installation

1. **Install Google Analytics Debugger** (Chrome Extension)
   - [Chrome Web Store Link](https://chrome.google.com/webstore/detail/google-analytics-debugger/)

2. **Test Tracking**
   - Open your site: `http://localhost:3000`
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Look for GA4 debug messages
   - Navigate between pages to test page view tracking

3. **Real-Time Reports**
   - Go to Google Analytics
   - Navigate to Reports → Realtime
   - Open your site in another tab
   - You should see yourself in the real-time report

---

## 2. Event Tracking Implementation

### ✅ Available Event Tracking Functions

All functions are available in `lib/analytics.ts`:

#### A. Button Click Tracking

```typescript
import { trackButtonClick } from '@/lib/analytics';

// Example usage
<button onClick={() => {
  trackButtonClick('Submit Ticket', 'Hero Section');
  // ... your button logic
}}>
  Submit Ticket
</button>
```

#### B. Form Submission Tracking

```typescript
import { trackFormSubmission } from '@/lib/analytics';

// Example usage
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ... form submission logic
    trackFormSubmission('Ticket Submission Form', true);
  } catch (error) {
    trackFormSubmission('Ticket Submission Form', false);
  }
};
```

#### C. Ticket Submission Tracking

```typescript
import { trackTicketSubmission } from '@/lib/analytics';

// Example usage
trackTicketSubmission('Hardware', 4); // category, urgency
```

#### D. Login Tracking

```typescript
import { trackLogin } from '@/lib/analytics';

// Example usage
trackLogin('credentials', 'it_staff'); // method, role
trackLogin('google', 'end_user');
```

#### E. Widget Interaction Tracking

```typescript
import { trackWidgetInteraction } from '@/lib/analytics';

// Example usage
trackWidgetInteraction('tickets_by_status', 'refresh');
trackWidgetInteraction('ticket_activity', 'expand');
```

#### F. Dashboard Customization Tracking

```typescript
import { trackDashboardCustomization } from '@/lib/analytics';

// Example usage
trackDashboardCustomization('add_widget', 'tickets_by_priority');
trackDashboardCustomization('remove_widget', 'ticket_activity');
trackDashboardCustomization('reorder_widgets');
```

#### G. Navigation Tracking

```typescript
import { trackNavigation } from '@/lib/analytics';

// Example usage
trackNavigation('/dashboard', 'home_page');
```

#### H. Error Tracking

```typescript
import { trackError } from '@/lib/analytics';

// Example usage
try {
  // ... code that might fail
} catch (error) {
  trackError('API Error', error.message, 'Dashboard');
}
```

#### I. Conversion Tracking

```typescript
import { trackConversion } from '@/lib/analytics';

// Example usage
trackConversion('ticket_submitted', 1);
trackConversion('user_signup', 1);
```

### 📝 Implementation Examples

#### Example 1: Track CTA Button Clicks (Homepage)

Update `app/page.tsx`:

```typescript
import { trackButtonClick } from '@/lib/analytics';

// In your component
<Link href="/submit">
  <Button 
    variant="success" 
    size="lg"
    onClick={() => trackButtonClick('Submit Ticket CTA', 'Hero Section')}
  >
    Submit a Ticket
  </Button>
</Link>
```

#### Example 2: Track Login Events

Update `app/login/page.tsx`:

```typescript
import { trackLogin, trackError } from '@/lib/analytics';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      trackError('Login Failed', 'Invalid credentials', 'Login Page');
    } else {
      // Determine role
      const role = username.startsWith('it_') ? 'it_staff' : 'end_user';
      trackLogin('credentials', role);
      
      // Redirect based on role
      if (role === 'it_staff') {
        router.push('/dashboard');
      } else {
        router.push('/submit');
      }
    }
  } catch (err) {
    setError('An error occurred during login');
    trackError('Login Error', err.message, 'Login Page');
  } finally {
    setIsLoading(false);
  }
};
```

#### Example 3: Track Ticket Submissions

Update `app/submit/page.tsx`:

```typescript
import { trackTicketSubmission, trackFormSubmission } from '@/lib/analytics';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      const data = await response.json();
      trackTicketSubmission(data.category, data.urgency_score);
      trackFormSubmission('Ticket Submission', true);
    } else {
      trackFormSubmission('Ticket Submission', false);
    }
  } catch (error) {
    trackFormSubmission('Ticket Submission', false);
  }
};
```

#### Example 4: Track Widget Interactions

Update widget components:

```typescript
import { trackWidgetInteraction } from '@/lib/analytics';

// In WidgetContainer or individual widgets
const handleRefresh = () => {
  trackWidgetInteraction(widgetType, 'refresh');
  onRefresh();
};

const handleRemove = () => {
  trackWidgetInteraction(widgetType, 'remove');
  onRemove();
};
```

---

## 3. Google Search Console Setup

### 🔍 Step-by-Step Setup

#### Step 1: Add Property

1. **Go to Google Search Console**
   - Visit [https://search.google.com/search-console](https://search.google.com/search-console)
   - Sign in with your Google account

2. **Add Property**
   - Click "Add property"
   - Choose "URL prefix" method
   - Enter: `https://swifttriage.com`
   - Click "Continue"

#### Step 2: Verify Ownership

**Method 1: HTML File Upload** (Recommended)
1. Download verification file
2. Place in `public/` directory
3. Deploy to production
4. Click "Verify" in Search Console

**Method 2: HTML Tag** (Already Implemented)
1. Copy verification meta tag
2. Add to `app/layout.tsx` in metadata:
   ```typescript
   verification: {
     google: 'your-verification-code-here',
   }
   ```
3. Deploy to production
4. Click "Verify" in Search Console

**Method 3: Google Analytics**
1. If you've already set up GA4
2. Use the same Google account
3. Search Console will auto-verify

#### Step 3: Submit Sitemap

1. **In Search Console**
   - Go to "Sitemaps" in left sidebar
   - Enter sitemap URL: `https://swifttriage.com/sitemap.xml`
   - Click "Submit"

2. **Verify Sitemap**
   - Wait 24-48 hours
   - Check "Sitemaps" section for status
   - Should show "Success" with number of pages discovered

#### Step 4: Monitor Performance

**Key Reports to Monitor**:
- **Performance**: Search queries, clicks, impressions, CTR
- **Coverage**: Indexed pages, errors, warnings
- **Enhancements**: Mobile usability, Core Web Vitals
- **Links**: Internal and external links

---

## 4. Custom Event Tracking Setup

### 📊 Recommended Events to Track

#### A. Homepage Events

```typescript
// Hero CTA clicks
trackButtonClick('Submit Ticket CTA', 'Hero Section');
trackButtonClick('View Dashboard CTA', 'Hero Section');

// Feature card clicks
trackButtonClick('Learn More', 'AI Triage Feature');

// Footer link clicks
trackNavigation('/dashboard', 'Footer');
```

#### B. Login Page Events

```typescript
// Login attempts
trackLogin('credentials', role);
trackLogin('google', role);
trackLogin('microsoft', role);

// Login errors
trackError('Login Failed', errorMessage, 'Login Page');

// Social login clicks
trackButtonClick('Google Login', 'Login Page');
trackButtonClick('Microsoft Login', 'Login Page');
```

#### C. Dashboard Events

```typescript
// Widget interactions
trackWidgetInteraction(widgetType, 'add');
trackWidgetInteraction(widgetType, 'remove');
trackWidgetInteraction(widgetType, 'refresh');
trackWidgetInteraction(widgetType, 'reorder');

// Dashboard customization
trackDashboardCustomization('add_widget', widgetType);
trackDashboardCustomization('configure_dashboard');
```

#### D. Ticket Submission Events

```typescript
// Form interactions
trackFormSubmission('Ticket Submission', success);
trackTicketSubmission(category, urgency);

// AI triage results
trackFeatureUsage('AI Triage', 'auto_categorize');
```

#### E. Conversion Events

```typescript
// Key conversions
trackConversion('ticket_submitted', 1);
trackConversion('user_signup', 1);
trackConversion('dashboard_accessed', 1);
```

---

## 5. Analytics Dashboard Setup

### 📈 Custom Reports to Create

#### A. Ticket Submission Funnel

1. **In Google Analytics**
   - Go to Explore → Create new exploration
   - Choose "Funnel exploration"

2. **Configure Steps**
   - Step 1: Page view `/submit`
   - Step 2: Event `form_start`
   - Step 3: Event `ticket_submitted`

3. **Save Report**
   - Name: "Ticket Submission Funnel"
   - Add to dashboard

#### B. User Engagement Report

1. **Create Custom Report**
   - Metrics: Sessions, Users, Engagement rate
   - Dimensions: Page, User type, Device category

2. **Add Filters**
   - Include: Engaged sessions
   - Exclude: Bounce sessions

#### C. Feature Usage Report

1. **Create Event Report**
   - Event name: `feature_used`
   - Dimensions: Feature name, Action
   - Metrics: Event count, Users

2. **Visualize**
   - Chart type: Bar chart
   - Sort by: Event count (descending)

---

## 6. Event Tracking Checklist

### ✅ Priority Events (Implement First)

- [ ] Page views (automatic)
- [ ] Button clicks (CTAs)
- [ ] Form submissions
- [ ] Ticket submissions
- [ ] Login events
- [ ] Navigation events
- [ ] Error tracking

### 🔄 Secondary Events (Implement Later)

- [ ] Widget interactions
- [ ] Dashboard customization
- [ ] Search queries
- [ ] Social shares
- [ ] Downloads
- [ ] Outbound links
- [ ] Video plays (if applicable)

### 📊 Conversion Events (Critical)

- [ ] Ticket submitted
- [ ] User signup
- [ ] Dashboard accessed
- [ ] Feature used

---

## 7. Privacy & Compliance

### 🔒 GDPR Compliance

1. **Cookie Consent** (To Be Implemented)
   - Add cookie consent banner
   - Allow users to opt-out of tracking
   - Respect Do Not Track (DNT) headers

2. **Privacy Policy** (To Be Created)
   - Disclose analytics usage
   - Explain data collection
   - Provide opt-out instructions

3. **Data Retention**
   - Configure in GA4 settings
   - Recommended: 14 months
   - Can be adjusted based on needs

### 🛡️ Data Anonymization

Already configured in `lib/analytics.ts`:
- IP anonymization (automatic in GA4)
- No personally identifiable information (PII) tracked
- User IDs are anonymized

---

## 8. Testing & Debugging

### 🧪 Local Testing

1. **Enable Debug Mode**
   ```typescript
   // In lib/analytics.ts, add:
   export const DEBUG_MODE = process.env.NODE_ENV === 'development';
   
   export const event = ({ action, category, label, value, ...params }: EventParams) => {
     if (DEBUG_MODE) {
       console.log('📊 Analytics Event:', { action, category, label, value, ...params });
     }
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', action, {
         event_category: category,
         event_label: label,
         value: value,
         ...params,
       });
     }
   };
   ```

2. **Test Events**
   - Open browser console
   - Trigger events (click buttons, submit forms)
   - Verify console logs appear

3. **Use GA Debugger**
   - Install Chrome extension
   - Enable debugger
   - Check console for GA4 hits

### 🔍 Production Testing

1. **Real-Time Reports**
   - Go to GA4 → Reports → Realtime
   - Perform actions on your site
   - Verify events appear in real-time

2. **DebugView** (GA4)
   - Enable debug mode: Add `?debug_mode=true` to URL
   - Go to GA4 → Configure → DebugView
   - See events in real-time with full details

---

## 9. Monitoring & Optimization

### 📊 Key Metrics to Monitor

**Daily**:
- Active users
- Page views
- Bounce rate
- Average session duration

**Weekly**:
- Conversion rate
- Top pages
- Traffic sources
- Device breakdown

**Monthly**:
- User growth
- Feature usage trends
- Funnel performance
- Goal completions

### 🎯 Optimization Tips

1. **Improve Conversion Rate**
   - Analyze funnel drop-offs
   - A/B test CTAs
   - Optimize page load speed

2. **Reduce Bounce Rate**
   - Improve content relevance
   - Enhance page speed
   - Add clear CTAs

3. **Increase Engagement**
   - Track feature usage
   - Identify popular features
   - Promote underused features

---

## 10. Advanced Features

### 🚀 To Be Implemented

1. **User ID Tracking**
   - Track logged-in users across sessions
   - Requires user consent

2. **Enhanced E-commerce** (if applicable)
   - Track pricing page views
   - Monitor upgrade conversions

3. **Custom Dimensions**
   - User role (IT staff vs end user)
   - Ticket category
   - Widget types used

4. **Custom Metrics**
   - Average ticket resolution time
   - Dashboard customization rate
   - Feature adoption rate

---

## 11. Troubleshooting

### ❌ Common Issues

**Issue 1: Events Not Showing in GA4**
- **Solution**: Check Measurement ID is correct
- **Solution**: Verify environment variable is set
- **Solution**: Clear browser cache and test again
- **Solution**: Wait 24-48 hours for data to appear

**Issue 2: Page Views Not Tracking**
- **Solution**: Verify GoogleAnalytics component is in providers
- **Solution**: Check browser console for errors
- **Solution**: Test with GA Debugger extension

**Issue 3: Real-Time Reports Empty**
- **Solution**: Ensure you're testing on the correct property
- **Solution**: Check if ad blockers are enabled
- **Solution**: Verify gtag script is loading

---

## 12. Next Steps

### Immediate (Week 1)
1. ✅ Set up Google Analytics 4 property
2. ✅ Add Measurement ID to `.env.local`
3. ✅ Verify tracking is working
4. ✅ Set up Google Search Console
5. ✅ Submit sitemap

### Short-term (Month 1)
1. Implement priority event tracking
2. Create custom reports
3. Set up conversion goals
4. Add cookie consent banner
5. Create privacy policy

### Long-term (Quarter 1)
1. Analyze user behavior patterns
2. Optimize conversion funnels
3. A/B test key pages
4. Implement advanced features
5. Regular performance reviews

---

## Conclusion

SwiftTriage now has a complete analytics foundation with:
- ✅ Google Analytics 4 integration
- ✅ Automatic page view tracking
- ✅ 20+ event tracking functions
- ✅ Error tracking
- ✅ Conversion tracking
- ✅ Privacy-compliant implementation

Follow this guide to complete the setup and start tracking user behavior to optimize SwiftTriage for better conversions and user experience.

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Status**: ✅ Implementation Complete - Setup Required
