# Requirement Verification Questions

Please answer the following questions to finalize the functional and non-functional requirements for SwiftTriage.

## Question 1
How should we handle user authentication and identity for submitting tickets?

A) Anonymous submission (users just type their name/email in the form)
B) User accounts required for everyone (NextAuth/Auth.js)
C) Open submission for users, but strict authentication required for the IT Dashboard
D) Single Sign-On (SSO) integration (e.g., Google/Microsoft)
E) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 2
What is the preferred UI/UX aesthetic for the frontend application?

A) Dark mode default (modern, developer-focused aesthetic)
B) Light mode default (clean, traditional corporate aesthetic)
C) Toggleable Dark/Light mode
D) Other (please describe after [Answer]: tag below)

[Answer]: Dark mode default

## Question 3
For the IT Technician Dashboard, what level of ticket management is required for this initial version?

A) Read-only view (just see the AI-categorized tickets)
B) Read and Update (ability to view tickets and change their status to 'Resolved')
C) Full CRUD (ability to create, read, update, and delete tickets manually)
D) Read, Update, plus basic analytics (e.g., count of tickets by category)
E) Other (please describe after [Answer]: tag below)

[Answer]: B