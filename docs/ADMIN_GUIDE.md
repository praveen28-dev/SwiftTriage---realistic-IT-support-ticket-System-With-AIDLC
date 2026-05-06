# SwiftTriage Administrator Guide

This guide provides comprehensive instructions for IT staff and administrators managing SwiftTriage.

---

## Table of Contents

1. [Admin Dashboard](#admin-dashboard)
2. [Ticket Management](#ticket-management)
3. [Customer Management](#customer-management)
4. [Widget System](#widget-system)
5. [User Management](#user-management)
6. [Reporting and Analytics](#reporting-and-analytics)
7. [System Configuration](#system-configuration)
8. [Best Practices](#best-practices)

---

## Admin Dashboard

### Accessing Admin Features

**Login as IT Staff:**
- Username must start with `it_` (e.g., `it_admin`, `it_john`)
- Or have `it_staff` role in the database

**Admin Navigation:**
- Full sidebar access including System section
- Access to all tickets (not just own)
- Customer management
- Reports and insights
- Admin settings

### Dashboard Customization

#### Adding Widgets

1. Click "Configure Dashboard" button
2. Select from 10 available widget types:
   - Tickets by Status
   - Tickets by Priority
   - Tickets by Category
   - Tickets by Tech Group
   - Tickets by Alert Level
   - Tickets by Request Type
   - Ticket Activity Feed
   - Tickets by Alert Condition
   - Customer Satisfaction
   - Ticket Trends

3. Click "Add Widget" for desired type
4. Widget appears on dashboard

#### Rearranging Widgets

1. **Drag-and-Drop:**
   - Click and hold the grip icon (⋮⋮) on any widget
   - Drag to desired position
   - Release to drop
   - Position saves automatically

2. **Resizing Widgets:**
   - Click widget menu (⋯)
   - Select "Edit Widget"
   - Choose size: Small (1 column), Medium (2 columns), Large (3 columns)
   - Click "Save"

#### Editing Widgets

1. Click widget menu (⋯)
2. Select "Edit Widget"
3. Configure options:
   - **Title**: Custom widget title
   - **Date Range**: All time, Last 7/30/90 days
   - **Limit**: Number of items to display (5-50)
   - **Sort Order**: Ascending or Descending
4. Click "Save Changes"

#### Removing Widgets

1. Click widget menu (⋯)
2. Select "Remove Widget"
3. Confirm removal
4. Widget is removed from dashboard

#### Widget Actions

- **Refresh Data**: Manually refresh widget data
- **Export Data**: Download widget data as CSV
- **Auto-Refresh**: Widgets auto-refresh every 30 seconds

---

## Ticket Management

### Viewing All Tickets

**Access:**
- Navigate to "All Tickets" in sidebar
- Or go to `/tickets`

**Features:**
- View all company tickets (not just assigned to you)
- Advanced filtering and search
- Bulk operations
- Export to CSV

### Ticket Workflow

#### 1. New Ticket Arrives

**Notification:**
- Dashboard shows new ticket count
- Activity feed displays new submission
- Email notification (if configured)

**Initial Review:**
1. Check AI triage results:
   - Category (Hardware, Network, Access, Software)
   - Urgency Score (1-5)
   - AI Summary
2. Verify categorization is correct
3. Adjust priority if needed

#### 2. Assign Ticket

**Assignment Options:**
- Assign to yourself
- Assign to team member
- Assign to tech group
- Leave unassigned for queue

**How to Assign:**
1. Open ticket details
2. Click "Assign" button
3. Select technician or group
4. Add assignment note (optional)
5. Click "Assign Ticket"

**Status Changes:**
- Status automatically changes to "Assigned"
- Assignee receives notification
- Customer receives update email

#### 3. Work on Ticket

**Update Status:**
- **In Progress**: Currently working on it
- **Pending**: Waiting for customer response
- **On Hold**: Blocked by external factor

**Add Notes:**
- Internal notes (visible to IT staff only)
- Customer-facing comments (visible to customer)
- Attach resolution steps

**Track Time:**
- Log time spent on ticket
- Track against SLA targets

#### 4. Resolve Ticket

**Resolution Steps:**
1. Fix the issue
2. Document the solution
3. Update ticket status to "Resolved"
4. Add resolution notes
5. Notify customer

**Resolution Notes Should Include:**
- What was wrong
- What was done to fix it
- Any follow-up actions needed
- Prevention tips for customer

#### 5. Close Ticket

**When to Close:**
- Customer confirms resolution
- No response after 7 days (auto-close)
- Issue verified as fixed

**Closing Process:**
1. Verify resolution with customer
2. Update status to "Closed"
3. Add final notes
4. Archive ticket

### Ticket Prioritization

#### Priority Matrix

| Urgency | Impact | Priority | Response Time |
|---------|--------|----------|---------------|
| High | High | Critical | < 1 hour |
| High | Medium | High | < 4 hours |
| Medium | High | High | < 4 hours |
| Medium | Medium | Medium | < 1 day |
| Low | Low | Low | < 3 days |

#### Escalation Rules

**Escalate When:**
- SLA breach imminent
- Customer is VIP/Enterprise tier
- Issue affects multiple users
- Security or data loss risk
- Technician needs help

**Escalation Process:**
1. Click "Escalate" button
2. Select escalation level
3. Add escalation reason
4. Notify manager/senior tech
5. Update ticket priority

### Bulk Operations

**Select Multiple Tickets:**
- Check boxes next to tickets
- Or use "Select All" option

**Bulk Actions:**
- Assign to technician
- Change status
- Update priority
- Add tags
- Export selected
- Close multiple tickets

---

## Customer Management

### Customer Profiles

**Access:**
- Navigate to "Customers" in sidebar
- Or go to `/customers`

**Customer List Features:**
- Search by name, email, or company
- Filter by tier (Free, Pro, Enterprise)
- Sort by CDI rating, revenue, or name
- Pagination (20 per page)

### Creating a Customer

1. Click "Add Customer" button
2. Fill out form:
   - **Name**: Customer name (required)
   - **Email**: Contact email (required)
   - **Company**: Company name
   - **Tier**: Free, Pro, or Enterprise
   - **Annual Revenue**: Dollar amount
   - **Territory**: Geographic region
   - **Primary Contact**: Main contact person
3. Click "Create Customer"

### Customer Detail View

**Tabs:**

1. **Details**
   - Basic information
   - CDI rating
   - Tier and revenue
   - Edit customer info

2. **Contacts**
   - Primary contact
   - Additional contacts
   - Contact history

3. **Tickets**
   - All tickets for this customer
   - Filter by status
   - Quick ticket creation

4. **Activities**
   - Calls, emails, meetings, notes
   - Activity timeline
   - Add new activity

5. **Products**
   - Products owned by customer
   - Purchase dates and quantities
   - Add/remove products

6. **Calendar**
   - Scheduled appointments
   - Follow-up reminders
   - SLA deadlines

7. **SLA**
   - SLA policy details
   - Response/resolution times
   - SLA compliance metrics

8. **Tasks**
   - Open tasks for customer
   - Completed tasks
   - Create new task

### CDI Rating (Customer Dissatisfaction Index)

**What is CDI?**
- Measures customer satisfaction (1-5 scale)
- Lower is better (1 = very satisfied, 5 = very dissatisfied)
- Calculated from ticket resolution times, escalations, and feedback

**CDI Thresholds:**
- **1.0-2.0**: Excellent (Green)
- **2.1-3.0**: Good (Yellow)
- **3.1-4.0**: Fair (Orange)
- **4.1-5.0**: Poor (Red)

**Improving CDI:**
- Faster response times
- Better first-contact resolution
- Proactive communication
- Follow-up after resolution

### Activity Tracking

**Activity Types:**
- **Call**: Phone conversation
- **Email**: Email correspondence
- **Meeting**: In-person or virtual meeting
- **Note**: General note or observation

**Creating an Activity:**
1. Go to customer detail page
2. Click "Activities" tab
3. Click "Add Activity" button
4. Fill out form:
   - Type (Call, Email, Meeting, Note)
   - Description
   - Link to ticket (optional)
5. Click "Save Activity"

---

## Widget System

### Widget Types Explained

#### 1. Tickets by Status
- **Type**: Pie chart
- **Data**: Ticket count by status (Open, Closed, Resolved, etc.)
- **Interaction**: Click legend to filter tickets by status
- **Use Case**: Quick overview of ticket distribution

#### 2. Tickets by Priority
- **Type**: Pie chart with color coding
- **Data**: Ticket count by priority level
- **Colors**: Red (Critical), Orange (High), Yellow (Medium), Green (Low)
- **Use Case**: Identify high-priority workload

#### 3. Tickets by Category
- **Type**: Donut chart
- **Data**: Ticket count by category (Hardware, Network, Access, Software)
- **Use Case**: Understand common issue types

#### 4. Tickets by Tech Group
- **Type**: Pie chart
- **Data**: Workload distribution across tech teams
- **Use Case**: Balance workload, identify bottlenecks

#### 5. Tickets by Alert Level
- **Type**: Pie chart
- **Data**: SLA alert status (No Alerts, Second Alert, Third Alert)
- **Use Case**: Monitor SLA compliance

#### 6. Tickets by Request Type
- **Type**: Horizontal bar chart
- **Data**: Ticket count by request type (sorted by volume)
- **Use Case**: Identify most common request types

#### 7. Ticket Activity Feed
- **Type**: Dynamic list
- **Data**: Real-time ticket updates and changes
- **Features**: Expandable entries, user links, ticket links
- **Use Case**: Monitor recent activity

#### 8. Tickets by Alert Condition
- **Type**: Simple bar chart
- **Data**: SLA breaches and incomplete tasks
- **Use Case**: Track SLA violations

#### 9. Customer Satisfaction
- **Type**: Gauge chart
- **Data**: Average CDI rating with trend indicator
- **Use Case**: Monitor overall customer satisfaction

#### 10. Ticket Trends
- **Type**: Multi-line chart
- **Data**: Ticket volume over time
- **Use Case**: Identify trends and patterns

### Widget Best Practices

**Dashboard Layout:**
- Place most important widgets at top
- Group related widgets together
- Use large size for complex charts
- Use small size for simple metrics

**Widget Configuration:**
- Set appropriate date ranges
- Limit items to avoid clutter
- Use descriptive titles
- Export data for deeper analysis

**Performance:**
- Don't add too many widgets (max 12 recommended)
- Use longer polling intervals for less critical data
- Remove unused widgets

---

## User Management

### User Roles

**End User:**
- Submit tickets
- View own tickets
- Basic dashboard access
- No admin features

**IT Staff:**
- All end user features
- View all tickets
- Assign and manage tickets
- Customer management
- Full dashboard customization
- Reports and analytics
- Admin settings

### Creating Users

**Current Method:**
- Users are created via authentication system
- Username determines role:
  - Starts with `it_`: IT Staff role
  - Other: End User role

**Future Enhancement:**
- User management UI (planned)
- Role assignment interface
- Permission customization

### Managing User Access

**Revoking Access:**
- Remove user from authentication system
- User cannot log in
- Existing tickets remain

**Changing Roles:**
- Update user role in database
- User must log out and log back in
- New permissions take effect

---

## Reporting and Analytics

### Available Reports

#### 1. Ticket Statistics
- **Access**: Dashboard widgets or `/reports/tickets`
- **Metrics**:
  - Total tickets (by period)
  - Open vs. Closed ratio
  - Average resolution time
  - First response time
  - SLA compliance rate

#### 2. Technician Performance
- **Access**: `/reports/technicians`
- **Metrics**:
  - Tickets assigned
  - Tickets resolved
  - Average resolution time
  - Customer satisfaction rating
  - SLA compliance

#### 3. Customer Reports
- **Access**: `/reports/customers`
- **Metrics**:
  - Tickets per customer
  - CDI ratings
  - Revenue vs. support cost
  - Top customers by volume

#### 4. Trend Analysis
- **Access**: Ticket Trends widget
- **Metrics**:
  - Ticket volume over time
  - Category trends
  - Priority trends
  - Seasonal patterns

### Exporting Data

**Widget Export:**
1. Click widget menu (⋯)
2. Select "Export Data"
3. CSV file downloads automatically

**Bulk Export:**
1. Go to ticket list
2. Select tickets (or select all)
3. Click "Export Selected"
4. Choose format (CSV, Excel)

**API Export:**
- Use API endpoints for programmatic access
- See [API Documentation](API.md)

---

## System Configuration

### Application Settings

**Configuration File:** `lib/config.ts`

```typescript
export const config = {
  groq: {
    model: 'llama-3.3-70b-versatile', // AI model
  },
  app: {
    pollingInterval: 5000, // Auto-refresh interval (ms)
  },
};
```

### Authentication Settings

**Configuration File:** `lib/auth.ts`

**Customize:**
- Authentication providers
- Session duration
- JWT token settings
- Login page URL

### Database Maintenance

**Regular Tasks:**
- Monitor database size
- Review slow queries
- Optimize indexes
- Archive old tickets

**Backup:**
- Neon provides automatic backups
- Configure backup retention
- Test restore procedures

### Performance Tuning

**Frontend:**
- Adjust polling intervals
- Limit widget count
- Enable caching

**Backend:**
- Database connection pooling
- Query optimization
- API response caching

**See:** [Performance Optimization Guide](../aidlc-docs/performance-optimization-guide.md)

---

## Best Practices

### Ticket Management

✅ **DO:**
- Respond to tickets within SLA targets
- Keep customers informed of progress
- Document all resolutions
- Close tickets promptly
- Use consistent categorization

❌ **DON'T:**
- Leave tickets unassigned for long
- Close tickets without customer confirmation
- Skip documentation
- Ignore SLA alerts

### Customer Communication

✅ **DO:**
- Use professional language
- Set clear expectations
- Provide regular updates
- Confirm resolution
- Follow up after closure

❌ **DON'T:**
- Use technical jargon
- Make promises you can't keep
- Ignore customer responses
- Close tickets prematurely

### Dashboard Usage

✅ **DO:**
- Check dashboard regularly
- Monitor SLA alerts
- Review activity feed
- Export data for analysis
- Customize for your workflow

❌ **DON'T:**
- Ignore critical alerts
- Overload with too many widgets
- Forget to refresh data
- Skip trend analysis

### Security

✅ **DO:**
- Log out on shared computers
- Use strong passwords
- Report security issues immediately
- Follow data privacy policies
- Keep software updated

❌ **DON'T:**
- Share login credentials
- Access from unsecured networks
- Expose customer data
- Ignore security alerts

---

## Troubleshooting

### Common Admin Issues

**Issue: Can't see admin features**
- Verify username starts with `it_`
- Check role in database
- Log out and log back in

**Issue: Widgets not loading**
- Check browser console for errors
- Verify API endpoints are accessible
- Clear browser cache

**Issue: Can't assign tickets**
- Verify you have IT staff role
- Check ticket is not already assigned
- Refresh the page

**Issue: Export not working**
- Check browser allows downloads
- Verify data exists in widget
- Try different browser

---

## Getting Help

### Support Resources

- **Documentation**: [docs/](.)
- **API Reference**: [API.md](API.md)
- **Performance Guide**: [../aidlc-docs/performance-optimization-guide.md](../aidlc-docs/performance-optimization-guide.md)
- **Error Monitoring**: [../aidlc-docs/error-monitoring-setup.md](../aidlc-docs/error-monitoring-setup.md)

### Contact

- **Technical Support**: support@swifttriage.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**For IT Staff and Administrators**
