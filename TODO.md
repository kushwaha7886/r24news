# TODO: Complete MediaAssets.jsx Page

## Overview
Implement the MediaAssets.jsx page to list, view, edit, and delete media assets based on the MediaAsset model and controller. The page should display media assets in a grid with previews for images/videos, links for YouTube/documents, and include options for admins/editors to manage them. It will fetch data from the /media-assets API endpoint with pagination support.

## Tasks
- [ ] Create MediaAssets.jsx component structure
- [ ] Implement state management for media assets, loading, pagination, and filters
- [ ] Add API calls to fetch media assets with pagination and filters
- [ ] Create grid layout to display media assets with appropriate previews
- [ ] Add modal for viewing media asset details
- [ ] Implement edit functionality for media assets
- [ ] Implement delete functionality for media assets
- [ ] Add role-based access control for admin/editor actions
- [ ] Add pagination controls
- [ ] Add filter options (by type, article)
- [ ] Style the component with Tailwind CSS
- [ ] Test the component functionality

## Dependencies
- MediaAsset model: type (Image/Video/Document/YouTube), url, caption, article reference
- MediaAsset controller: getMediaAssets (with pagination), getMediaAssetById, updateMediaAsset, deleteMediaAsset
- API endpoints: GET /media-assets, GET /media-assets/:id, PUT /media-assets/:id, DELETE /media-assets/:id
- AuthContext for user role checking
- React Router for navigation
- React Icons for UI elements
