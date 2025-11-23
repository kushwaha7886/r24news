# TODO: Fix Add Journalist Issue for Admin and Editor

## Issues Identified
- ProtectedRoute.jsx incorrectly maps user.userType 'admin' to 'reader'
- /add-journalist route in App.jsx allows only 'admin', but button shown to 'editor' and 'admin'
- Missing backend POST /journalists route for creating journalists
- Missing backend DELETE /journalists/:id route for deleting journalists
- User.controller.js lacks createJournalist and deleteJournalist functions

## Steps to Complete
- [ ] Fix ProtectedRoute.jsx to correctly map user.userType to role
- [ ] Update App.jsx /add-journalist route to allow ['editor', 'admin']
- [ ] Add createJournalist function in User.controller.js
- [ ] Add deleteJournalist function in User.controller.js
- [ ] Update User.route.js to add POST /journalists and DELETE /journalists/:id routes
- [ ] Test the functionality: login as editor/admin, add journalist, verify creation
