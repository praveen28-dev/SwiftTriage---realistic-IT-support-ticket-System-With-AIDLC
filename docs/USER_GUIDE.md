# SwiftTriage User Guide

Welcome to SwiftTriage! This guide will help you get started with submitting tickets, tracking their status, and using the dashboard effectively.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Submitting a Ticket](#submitting-a-ticket)
3. [Viewing Your Tickets](#viewing-your-tickets)
4. [Understanding Ticket Status](#understanding-ticket-status)
5. [Dashboard Overview](#dashboard-overview)
6. [Tips for Better Tickets](#tips-for-better-tickets)
7. [FAQ](#faq)

---

## Getting Started

### Logging In

1. Navigate to the SwiftTriage login page
2. Enter your credentials:
   - **Username**: Your assigned username
   - **Password**: Your password
3. Click "Sign In"

**Demo Credentials** (for testing):
- **End User**: username: `user`, password: `password`
- **IT Staff**: username: `it_admin`, password: `password`

### First Time Login

After your first login, you'll see:
- **Home Page**: Overview of SwiftTriage features
- **Navigation**: Access to Submit Ticket, Dashboard, and Profile
- **Welcome Message**: Quick start guide

---

## Submitting a Ticket

### Step-by-Step Guide

1. **Navigate to Submit Page**
   - Click "Submit Ticket" in the navigation menu
   - Or go directly to `/submit`

2. **Fill Out the Form**

   **Describe Your Issue** (Required)
   - Be specific and detailed
   - Include error messages if applicable
   - Mention when the problem started
   - Describe what you were doing when it occurred

   **Example Good Description:**
   ```
   My laptop won't connect to the office Wi-Fi network "CompanyWiFi" 
   since this morning. I can see the network but get an "Authentication 
   Error" message when I try to connect. My phone connects fine to the 
   same network. I've tried restarting my laptop twice.
   ```

   **Example Poor Description:**
   ```
   WiFi not working
   ```

   **Your Contact Information** (Required)
   - Enter your email address
   - This is how IT will contact you for updates

3. **Submit the Ticket**
   - Click "Submit Ticket" button
   - Wait for AI processing (usually 2-3 seconds)

4. **Review AI Triage Results**

   After submission, you'll see:
   - **Ticket ID**: Your unique ticket number (e.g., #12345)
   - **Category**: Hardware, Network, Access, Software, or Uncategorized
   - **Urgency Score**: 1 (Low) to 5 (Critical)
   - **AI Summary**: One-sentence summary of your issue
   - **Status**: Initially set to "Open"

5. **Save Your Ticket ID**
   - Write down or screenshot your Ticket ID
   - You'll need this to track your ticket

---

## Viewing Your Tickets

### Dashboard View

1. **Navigate to Dashboard**
   - Click "Dashboard" in the navigation menu
   - Or go to `/dashboard`

2. **View Recent Tickets Widget**
   - Shows your most recent tickets
   - Displays: Ticket ID, Summary, Status, Priority
   - Click on any ticket to view details

### Ticket List View

1. **Navigate to My Tickets**
   - Click "My Tickets" in the sidebar
   - Or go to `/tickets`

2. **Filter and Search**
   - **Search**: Enter ticket ID or keywords
   - **Filter by Status**: Open, Closed, Resolved, Pending
   - **Filter by Priority**: Critical, High, Medium, Low
   - **Sort**: By date, priority, or status

3. **View Ticket Details**
   - Click on any ticket row
   - See full description, AI analysis, and history
   - View assigned technician (if assigned)
   - Check resolution notes (if resolved)

---

## Understanding Ticket Status

### Status Types

| Status | Meaning | What to Expect |
|--------|---------|----------------|
| **Open** | Ticket submitted, awaiting assignment | IT will review and assign soon |
| **Assigned** | Ticket assigned to a technician | Technician will contact you |
| **In Progress** | Technician is working on it | Resolution in progress |
| **Pending** | Waiting for information from you | Check your email for requests |
| **Resolved** | Issue has been fixed | Verify the fix works |
| **Closed** | Ticket completed and verified | No further action needed |
| **Cancelled** | Ticket cancelled or duplicate | Issue resolved another way |

### Priority Levels

| Priority | Urgency Score | Response Time | Examples |
|----------|---------------|---------------|----------|
| **Critical** | 5 | < 1 hour | System down, data loss, security breach |
| **High** | 4 | < 4 hours | Major feature broken, multiple users affected |
| **Medium** | 3 | < 1 day | Single user issue, workaround available |
| **Low** | 1-2 | < 3 days | Minor issue, enhancement request |

### Category Types

| Category | Description | Examples |
|----------|-------------|----------|
| **Hardware** | Physical equipment issues | Laptop won't start, printer jammed, monitor flickering |
| **Network** | Connectivity problems | Wi-Fi not working, VPN issues, slow internet |
| **Access** | Login and permission issues | Can't log in, need access to folder, password reset |
| **Software** | Application problems | App crashes, software not installing, feature not working |
| **Uncategorized** | AI couldn't determine category | Vague or complex issues |

---

## Dashboard Overview

### For End Users

The dashboard provides a quick overview of your tickets and IT service status.

#### Widgets You'll See

1. **Statistics Cards**
   - Total tickets submitted
   - Open tickets count
   - Average resolution time
   - Your satisfaction rating

2. **Recent Tickets**
   - Your last 5 tickets
   - Quick status view
   - Click to see details

3. **Ticket Distribution**
   - Pie chart showing your tickets by status
   - Visual breakdown of open vs. closed

4. **Activity Feed**
   - Recent updates on your tickets
   - Technician assignments
   - Status changes

### Dashboard Features

- **Auto-Refresh**: Dashboard updates every 30 seconds
- **Click-Through**: Click on charts to filter tickets
- **Responsive**: Works on desktop, tablet, and mobile

---

## Tips for Better Tickets

### Writing Effective Descriptions

✅ **DO:**
- Be specific and detailed
- Include error messages (copy/paste exact text)
- Mention when the problem started
- Describe steps to reproduce the issue
- Include what you've already tried
- Attach screenshots if helpful

❌ **DON'T:**
- Use vague descriptions ("It's broken")
- Skip important details
- Assume IT knows your setup
- Submit duplicate tickets
- Use all caps or excessive punctuation

### Example Templates

**Hardware Issue:**
```
Device: [Laptop model/Desktop ID]
Problem: [What's not working]
When: [When did it start]
Error: [Any error messages]
Tried: [What you've attempted]
```

**Software Issue:**
```
Application: [Software name and version]
Problem: [What's not working]
Steps: [How to reproduce]
Error: [Error message or code]
Expected: [What should happen]
Actual: [What actually happens]
```

**Network Issue:**
```
Location: [Office/Home/Remote]
Network: [Wi-Fi name or wired]
Problem: [Connection issue details]
Devices: [Affected devices]
When: [When did it start]
```

### Getting Faster Resolution

1. **Provide Complete Information**
   - More details = faster diagnosis
   - Include all relevant context

2. **Respond Promptly**
   - Check your email regularly
   - Reply to IT requests quickly
   - Provide requested information

3. **Be Available**
   - Mention your availability in the ticket
   - Provide best contact method
   - Schedule time for remote support

4. **Test and Confirm**
   - Test the fix when IT resolves your ticket
   - Confirm if it works or still has issues
   - Provide feedback

---

## FAQ

### General Questions

**Q: How long does it take to get help?**
A: Response times vary by priority:
- Critical: < 1 hour
- High: < 4 hours
- Medium: < 1 day
- Low: < 3 days

**Q: Can I submit tickets by email?**
A: Currently, tickets must be submitted through the web interface. Email integration is planned for a future release.

**Q: Can I attach files to tickets?**
A: File attachments are not yet supported. You can include links to cloud storage (Google Drive, OneDrive) in your description.

**Q: How do I update my ticket?**
A: Reply to the email notification from IT, or add a comment in the ticket detail view.

**Q: Can I see all company tickets?**
A: End users can only see their own tickets. IT staff can see all tickets.

### Ticket Submission

**Q: What if I don't know the category?**
A: Don't worry! The AI will automatically categorize your ticket. Just describe your issue clearly.

**Q: Can I submit tickets for other people?**
A: Yes, but include their contact information in the description so IT can reach them.

**Q: What if my issue is urgent?**
A: Describe the urgency in your ticket. The AI will assign an appropriate urgency score. For true emergencies, also call the IT helpdesk.

**Q: Can I edit a ticket after submission?**
A: You cannot edit the original description, but you can add comments with additional information.

### Dashboard and Tracking

**Q: Why don't I see all my old tickets?**
A: The dashboard shows recent tickets by default. Use the "My Tickets" page to see your complete history.

**Q: How often does the dashboard update?**
A: The dashboard auto-refreshes every 30 seconds. You can also manually refresh any widget.

**Q: Can I customize my dashboard?**
A: End users see a standard dashboard. IT staff can customize their dashboard with drag-and-drop widgets.

**Q: What does CDI rating mean?**
A: CDI (Customer Dissatisfaction Index) measures overall satisfaction with IT services. Lower is better (1-5 scale).

### Technical Issues

**Q: I can't log in. What should I do?**
A: Contact your IT administrator or helpdesk directly. They can reset your password or check your account status.

**Q: The website is slow or not loading.**
A: Try these steps:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Clear your browser cache
3. Try a different browser
4. Check your internet connection
5. Contact IT if the problem persists

**Q: I submitted a ticket but didn't get a confirmation.**
A: Check your spam folder for the confirmation email. If you don't see it, submit a new ticket or contact IT directly.

---

## Getting Help

### Support Channels

1. **Submit a Ticket**: Use the SwiftTriage system (preferred)
2. **Email**: support@swifttriage.com
3. **Phone**: Call your IT helpdesk (for urgent issues)
4. **In-Person**: Visit the IT support desk

### Additional Resources

- **Knowledge Base**: Browse common solutions (coming soon)
- **Video Tutorials**: Watch how-to videos (coming soon)
- **Community Forum**: Ask questions and share tips (coming soon)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `Cmd+K` | Open search |
| `Ctrl+N` or `Cmd+N` | New ticket |
| `Ctrl+D` or `Cmd+D` | Go to dashboard |
| `Esc` | Close modal/dialog |

---

## Mobile Access

SwiftTriage is fully responsive and works on mobile devices:

- **iOS**: Safari, Chrome
- **Android**: Chrome, Firefox
- **Features**: All core features available on mobile
- **Tip**: Add to home screen for app-like experience

---

## Privacy and Security

- **Your Data**: Only you and IT staff can see your tickets
- **Passwords**: Never share your password with anyone
- **Secure Connection**: Always use HTTPS (look for the lock icon)
- **Logout**: Always log out on shared computers

---

## Feedback

We value your feedback! Help us improve SwiftTriage:

- **Feature Requests**: Submit via feedback form
- **Bug Reports**: Submit a ticket with "Bug Report" in the title
- **Suggestions**: Email feedback@swifttriage.com

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Need Help?** Contact support@swifttriage.com
