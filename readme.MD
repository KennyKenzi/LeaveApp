#BASIC LEAVE REQUEST APP
App allows you to create "staff members" that can apply for a limited amount of leave through their registered supervisor.
These "supervisors" can then approve or reject applications


STEPS TO RUN
# Go to config/leavedata.js
- enter/edit details for temporary super admin 

# run mongod

# Run package
- npm install

# Open homepage in browser
- in this case: http://localhost:3000


# Delete line of code that creates superuser if needed
- In config/leavedata.js (line 8-16)
and 
- In index.js (line 9-31)