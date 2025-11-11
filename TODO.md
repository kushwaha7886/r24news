# Fix Frontend Pages Connectivity Issues

## Current Issues:
- App.jsx missing routes for Dashboard, Categories, Broadcasts, Journalists, MediaAssets, Profile, CreateArticle, EditArticle
- Categories page uses `/categories/:categoryId` route but not defined in App.jsx
- Navigation links point to undefined routes
- Schema relationships not fully utilized in frontend

## Tasks:
- [ ] Update App.jsx to include all missing routes
- [ ] Fix Categories page routing and navigation
- [ ] Add navigation links in Layout component
- [ ] Ensure proper data relationships display
- [ ] Test all routes and interconnections
