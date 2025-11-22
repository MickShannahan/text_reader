# Comments Feature Documentation

## Overview
The Comments feature allows users to annotate text by highlighting passages and adding comments. Comments are stored per text file and displayed contextually.

## Architecture

### Models
**`app/models/Comment.js`**
- Purpose: Represents a single comment/annotation
- Properties:
  - `id`: Unique comment identifier
  - `textFileId`: Reference to parent TextFile
  - `text`: The comment content (what user typed)
  - `selectedText`: The highlighted/selected text from the document
  - `startOffset`: Character offset where selection starts
  - `endOffset`: Character offset where selection ends
  - `createdAt`: Timestamp of creation
  - `updatedAt`: Last modification timestamp
- Methods:
  - `constructor(data)`: Initialize comment
  - `getHTMLTemplate()`: Return HTML for rendering

### Services
**`app/services/CommentsService.js`**
- Purpose: Handle comment CRUD operations and persistence
- Key Methods:
  - `addComment(textFileId, commentData)`: Create new comment
  - `removeComment(commentId)`: Delete a comment
  - `getCommentsByTextFile(textFileId)`: Get all comments for a file
  - `saveComments()`: Persist to localStorage
  - `loadComments()`: Restore from localStorage
  - `updateComment(commentId, data)`: Modify existing comment

### Controllers
**`app/controllers/CommentsController.js`**
- Purpose: Handle UI interactions and comment registration
- Key Methods:
  - `setupCommentSelection()`: Attach selection listeners to reader
  - `handleTextSelection(event)`: Show comment input when text selected
  - `showCommentBox(selectedText, range)`: Display the input popup
  - `registerCommentPopovers()`: Initialize Bootstrap popovers for comments
  - `highlightCommentsInText()`: Apply underline styling to commented text
  - `closeCommentBox()`: Hide the input popup
  - `submitComment(text, selectedText, startOffset, endOffset)`: Save comment

## Workflow

### Creating a Comment
1. User selects text in reader
2. `handleTextSelection()` triggers (checks if on Desktop or Mobile)
3. On Desktop: Comment box appears at selection
4. On Mobile: User clicks underlined text to show popover
5. User enters comment text and submits
6. `submitComment()` is called, creating new Comment
7. Comment is added to AppState
8. Comment is highlighted in text with underline
9. Comment is saved to localStorage

### Viewing Comments
1. When TextFile is rendered in ActiveTemplate
2. `registerCommentPopovers()` is called
3. Bootstrap popovers are initialized on all commented text
4. On Desktop: Comments show in right sidebar (`.comments-sidebar`)
5. On Mobile: Comments show in popovers on click

### Responsive Behavior
- **Desktop (>768px)**: 
  - Comments appear in right sidebar
  - Hovering over underlined text highlights it
  - Full comment visible to the right
  
- **Mobile (<768px)**:
  - Comments hidden by default
  - Click underlined text to show popover
  - Click outside to close popover

## Storage Structure
```
AppState.comments = [
  {
    id: "unique-id",
    textFileId: "file-id",
    text: "This is insightful",
    selectedText: "passage of text",
    startOffset: 245,
    endOffset: 262,
    createdAt: "2025-11-22T...",
    updatedAt: "2025-11-22T..."
  }
]
```

## Bootstrap Integration
- Uses `data-bs-toggle="popover"` for hover/click popovers
- Uses Bootstrap breakpoint utilities for responsive display
- CSS custom class `.comment-highlight` for underlined text
- Colors/styling customizable via CSS variables

## Files Created
1. `app/models/Comment.js` - Comment model
2. `app/services/CommentsService.js` - Service layer
3. `app/controllers/CommentsController.js` - Controller layer
4. CSS additions in `assets/style/style.css` for `.comment-highlight` and sidebar
