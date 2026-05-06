// SwiftTriage - Bulk Ticket Import Script
// Run this in browser console after logging in at http://localhost:3000/login

const tickets = [
  // Hardware Issues (8 tickets)
  {
    userInput: "My laptop won't turn on after the latest Windows update. The power button lights up but the screen stays black. I've tried holding the power button for 30 seconds but nothing happens. This is urgent as I have a client presentation in 2 hours.",
    contactEmail: "john.doe@acmecorp.com"
  },
  {
    userInput: "Office printer on the 3rd floor is jammed. Paper is stuck inside and it's showing error code E-52 on the display. Multiple people are waiting to print important documents for today's board meeting.",
    contactEmail: "sarah.johnson@acmecorp.com"
  },
  {
    userInput: "My second monitor keeps flickering and going black every few minutes. I've checked the cable connections and they seem fine. It's making it impossible to work on my spreadsheets.",
    contactEmail: "mike.chen@acmecorp.com"
  },
  {
    userInput: "Several keys on my keyboard are not working properly. The 'E', 'R', and spacebar are either not responding or typing multiple characters. I've tried cleaning it but the issue persists.",
    contactEmail: "emily.rodriguez@acmecorp.com"
  },
  {
    userInput: "My wireless mouse stopped working this morning. I've replaced the batteries and tried re-pairing it with the USB receiver but it's still not responding. Can I get a replacement?",
    contactEmail: "david.kim@acmecorp.com"
  },
  {
    userInput: "I'm getting a warning message that says 'Hard drive failure imminent - backup your data immediately'. My computer is running very slowly and making clicking noises. I'm worried about losing my work files.",
    contactEmail: "lisa.martinez@acmecorp.com"
  },
  {
    userInput: "My laptop gets extremely hot when I'm running multiple applications. The fan is constantly running at full speed and it's uncomfortable to use on my lap. Sometimes it shuts down unexpectedly.",
    contactEmail: "robert.taylor@acmecorp.com"
  },
  {
    userInput: "My laptop docking station is not recognizing my external monitors anymore. The USB ports work fine but the display ports are not detecting any monitors. I've tried different cables.",
    contactEmail: "jennifer.white@acmecorp.com"
  },
  
  // Network Issues (6 tickets)
  {
    userInput: "Can't connect to the office WiFi network 'CompanyWiFi'. My phone connects fine but my laptop keeps saying 'Authentication Error'. I've tried restarting my laptop twice and forgetting the network.",
    contactEmail: "james.anderson@acmecorp.com"
  },
  {
    userInput: "I'm working from home and can't connect to the company VPN. It says 'Connection timeout' after trying for about 2 minutes. I need access to the internal servers for my project deadline today.",
    contactEmail: "maria.garcia@acmecorp.com"
  },
  {
    userInput: "The internet connection in the marketing department is extremely slow. Websites take forever to load and file uploads are timing out. This is affecting our entire team's productivity.",
    contactEmail: "thomas.brown@acmecorp.com"
  },
  {
    userInput: "I keep getting disconnected from the network drive (Z:) every 10-15 minutes. I have to manually reconnect each time which is very disruptive to my work. This started happening yesterday.",
    contactEmail: "amanda.wilson@acmecorp.com"
  },
  {
    userInput: "Outlook keeps showing 'Trying to connect...' and I can't send or receive emails. I've checked my internet connection and it's working fine for web browsing. This is affecting my ability to communicate with clients.",
    contactEmail: "christopher.lee@acmecorp.com"
  },
  {
    userInput: "The ethernet port on my desk is not working. I've tried different cables and my laptop but nothing connects. The WiFi is too slow for my video conferences so I really need the wired connection.",
    contactEmail: "jessica.moore@acmecorp.com"
  },
  
  // Access Issues (5 tickets)
  {
    userInput: "Need access to the shared drive \\\\fileserver\\marketing for the Q2 campaign materials. My manager Sarah Johnson approved this last week but I still can't access it. I need this for tomorrow's presentation.",
    contactEmail: "daniel.harris@acmecorp.com"
  },
  {
    userInput: "I've been locked out of my account after entering the wrong password too many times. I need my password reset urgently as I have several deadlines today. My username is mclark.",
    contactEmail: "matthew.clark@acmecorp.com"
  },
  {
    userInput: "I need access to the Salesforce CRM system. I'm starting in the sales department next week and my manager said IT needs to grant me access. My employee ID is EMP-2847.",
    contactEmail: "olivia.lewis@acmecorp.com"
  },
  {
    userInput: "I'm a new employee starting today and I don't have VPN access yet. I need to work from home tomorrow and require remote access to the company network. HR said to contact IT for setup.",
    contactEmail: "william.walker@acmecorp.com"
  },
  {
    userInput: "I can view the customer database but I can't edit or add new records. I need write permissions to update customer information as part of my job responsibilities. This is blocking my work.",
    contactEmail: "sophia.hall@acmecorp.com"
  },
  
  // Software Issues (6 tickets)
  {
    userInput: "Microsoft Excel keeps crashing whenever I try to open large spreadsheets (over 10MB). I get an error message 'Excel has stopped working' and it closes automatically. I've tried restarting my computer.",
    contactEmail: "ethan.allen@acmecorp.com"
  },
  {
    userInput: "My Outlook calendar is not syncing with my phone. Meetings I create on my computer don't show up on my mobile device and vice versa. This is causing me to miss appointments.",
    contactEmail: "ava.young@acmecorp.com"
  },
  {
    userInput: "Adobe Acrobat is showing a license error and won't let me edit PDF files. It says 'Your license has expired' but I'm sure we have a company license. I need to edit contracts today.",
    contactEmail: "noah.king@acmecorp.com"
  },
  {
    userInput: "My antivirus software (McAfee) is showing a notification that it's out of date and needs to be updated. I tried updating it myself but it says I don't have administrator permissions.",
    contactEmail: "isabella.wright@acmecorp.com"
  },
  {
    userInput: "Microsoft Teams video is not working during calls. My camera works fine in other applications but in Teams it shows a black screen. Audio works perfectly. I have important client calls today.",
    contactEmail: "liam.lopez@acmecorp.com"
  },
  {
    userInput: "I need to install Python 3.11 and Visual Studio Code for my new development project. I don't have admin rights to install software. Can IT please install these for me or grant temporary admin access?",
    contactEmail: "mia.hill@acmecorp.com"
  }
];

// Bulk import function
async function bulkImportTickets() {
  console.log('%c🚀 Starting Bulk Ticket Import...', 'color: #00ff00; font-size: 16px; font-weight: bold;');
  console.log(`Total tickets to import: ${tickets.length}`);
  console.log('');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const ticketNum = i + 1;
    
    try {
      console.log(`%c[${ticketNum}/${tickets.length}] Creating ticket...`, 'color: #ffff00;');
      console.log(`  Email: ${ticket.contactEmail}`);
      console.log(`  Description: ${ticket.userInput.substring(0, 50)}...`);
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(ticket)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`%c  ✓ Success!`, 'color: #00ff00;');
      console.log(`    Ticket ID: ${data.ticket.id}`);
      console.log(`    Category: ${data.ticket.category}`);
      console.log(`    Urgency: ${data.ticket.urgencyScore}/5`);
      console.log(`    Summary: ${data.ticket.aiSummary}`);
      console.log('');
      
      successCount++;
      
      // Wait 3 seconds between tickets to avoid rate limiting and allow AI processing
      if (i < tickets.length - 1) {
        console.log(`  ⏳ Waiting 3 seconds before next ticket...`);
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`%c  ✗ Failed!`, 'color: #ff0000;');
      console.error(`    Error: ${error.message}`);
      console.log('');
      failCount++;
    }
  }
  
  // Summary
  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #00ffff;');
  console.log('%c📊 Import Complete!', 'color: #00ffff; font-size: 16px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════', 'color: #00ffff;');
  console.log(`%c✓ Successful: ${successCount}`, 'color: #00ff00; font-size: 14px;');
  console.log(`%c✗ Failed: ${failCount}`, 'color: #ff0000; font-size: 14px;');
  console.log(`%c📈 Success Rate: ${((successCount / tickets.length) * 100).toFixed(1)}%`, 'color: #ffff00; font-size: 14px;');
  console.log('');
  console.log('%cNext Steps:', 'color: #00ffff; font-weight: bold;');
  console.log('1. Go to http://localhost:3000/dashboard');
  console.log('2. Refresh the page to see all tickets');
  console.log('3. Verify widgets show updated statistics');
  console.log('4. Test drag-and-drop and widget features');
  console.log('');
}

// Instructions
console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color: #00ffff;');
console.log('%c║  SwiftTriage - Bulk Ticket Import Script                 ║', 'color: #00ffff; font-weight: bold;');
console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #00ffff;');
console.log('');
console.log('%cInstructions:', 'color: #ffff00; font-weight: bold;');
console.log('1. Make sure you are logged in at http://localhost:3000/login');
console.log('2. Run this command to start import:');
console.log('');
console.log('%c   bulkImportTickets()', 'color: #00ff00; font-size: 14px; font-weight: bold; background: #000; padding: 5px;');
console.log('');
console.log('%cNote:', 'color: #ff9900; font-weight: bold;');
console.log('- Import will take ~75 seconds (3 seconds per ticket)');
console.log('- Do not close this tab during import');
console.log('- Each ticket will be processed by AI (2-3 seconds)');
console.log('');

// Auto-run option (commented out by default)
// Uncomment the line below to auto-run on paste
// bulkImportTickets();
