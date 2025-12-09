# Git Version Control Guide

Your Travel Planner App is now under Git version control! This allows you to save changes, revert to previous versions, and track your development history.

## ✅ Current Status

- ✅ Git repository initialized
- ✅ Initial commit created (v1.0.0)
- ✅ All files tracked
- ✅ Ready to use

## 🎯 Common Git Commands

### Check Status
See what files have changed:
```bash
git status
```

### Save Changes (Commit)
Save your current work:
```bash
# Stage all changed files
git add .

# Create a commit with a message
git commit -m "Description of what you changed"
```

### View History
See all commits:
```bash
# Simple view
git log --oneline

# Detailed view
git log

# Last 5 commits
git log -5
```

### Revert to Previous Version

**Option 1: Undo uncommitted changes**
```bash
# Discard all uncommitted changes
git checkout .

# Discard changes to specific file
git checkout -- path/to/file.js
```

**Option 2: Go back to a previous commit**
```bash
# See all commits
git log --oneline

# Go back to specific commit (keeps history)
git revert <commit-hash>

# Go back to specific commit (rewrites history - use carefully!)
git reset --hard <commit-hash>
```

**Option 3: Create a new branch from old commit**
```bash
git checkout -b backup-branch <commit-hash>
```

### Create Branches
Work on features without affecting main code:
```bash
# Create and switch to new branch
git checkout -b feature-name

# Switch back to main branch
git checkout master

# List all branches
git branch
```

### Merge Branches
Combine branches:
```bash
# Switch to branch you want to merge into
git checkout master

# Merge feature branch into current branch
git merge feature-name
```

## 📋 Recommended Workflow

### Daily Work Pattern

1. **Start of day**: Check status
   ```bash
   git status
   ```

2. **Before making changes**: Create a branch (optional)
   ```bash
   git checkout -b feature/new-screen
   ```

3. **After adding a feature**: Commit
   ```bash
   git add .
   git commit -m "Add new statistics screen"
   ```

4. **Multiple times per day**: Commit your work
   - Commit when you complete a feature
   - Commit before trying something risky
   - Commit at end of work session

5. **When feature is complete**: Merge to main
   ```bash
   git checkout master
   git merge feature/new-screen
   ```

### Example Workflow

```bash
# Start working on new feature
git checkout -b add-dark-mode

# Make changes to files...
# ...edit code...

# Save your work
git add .
git commit -m "Add dark mode toggle to settings"

# Continue working...
# ...more changes...

# Save again
git add .
git commit -m "Fix dark mode color scheme"

# Feature complete, merge to main
git checkout master
git merge add-dark-mode

# Optional: Delete feature branch
git branch -d add-dark-mode
```

## 🔄 Commit Message Best Practices

### Good Commit Messages
```bash
git commit -m "Add expense tracking feature to budget screen"
git commit -m "Fix map marker positioning bug"
git commit -m "Update dependencies to Expo SDK 54"
git commit -m "Improve trip creation form validation"
```

### Poor Commit Messages (avoid these)
```bash
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
git commit -m "asdf"
```

### Commit Message Template
```
<Type>: <Short description>

Examples:
Add: Add user profile screen
Fix: Fix crash when deleting trip
Update: Update React Navigation to v7
Refactor: Simplify budget calculation logic
Docs: Update README with new installation steps
```

## 🆘 Emergency Commands

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Discard All Uncommitted Changes
```bash
git checkout .
```

### See What Changed
```bash
# See changes not yet staged
git diff

# See changes staged for commit
git diff --staged

# See changes in specific file
git diff path/to/file.js
```

## 📊 Useful Git Aliases

Add these to your Git config for shortcuts:

```bash
# Create shortcuts
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.ci commit
git config --global alias.br branch
git config --global alias.lg "log --oneline --graph --all"

# Now you can use:
git st       # instead of git status
git co main  # instead of git checkout main
git ci -m "message"  # instead of git commit -m "message"
git lg       # pretty log view
```

## 🌿 Branching Strategy

### Main Branch
- `master` (or `main`) - Stable, working code

### Feature Branches
- `feature/trip-sharing` - New features
- `fix/map-crash` - Bug fixes
- `update/expo-55` - Updates/upgrades
- `experiment/new-ui` - Experimental work

### Example
```bash
# Working on new feature
git checkout -b feature/photo-upload

# Bug found in main, switch to fix it
git checkout master
git checkout -b fix/budget-calculation

# Fix the bug
git add .
git commit -m "Fix budget calculation rounding error"

# Merge fix to main
git checkout master
git merge fix/budget-calculation

# Go back to feature work
git checkout feature/photo-upload
```

## 📁 What's Tracked

Git is tracking all these files:
- ✅ All source code (.js files)
- ✅ Configuration files (package.json, app.json, etc.)
- ✅ Documentation (.md files)
- ❌ node_modules/ (excluded via .gitignore)
- ❌ Build files (excluded via .gitignore)

## 🔍 View Your Git History

```bash
# Simple one-line view
git log --oneline

# Graphical view
git log --graph --oneline --all

# See specific file history
git log -- path/to/file.js

# See what changed in each commit
git log -p
```

## 💡 Pro Tips

1. **Commit Often**: Small, frequent commits are better than large ones
2. **Use Branches**: Don't be afraid to create branches for experiments
3. **Write Good Messages**: Future you will thank you
4. **Check Before Committing**: Always run `git status` first
5. **Test Before Committing**: Make sure code works before committing
6. **Don't Commit Secrets**: Never commit API keys, passwords, etc.

## 🎯 Quick Reference Card

| Task | Command |
|------|---------|
| Save changes | `git add . && git commit -m "message"` |
| See status | `git status` |
| See history | `git log --oneline` |
| Undo changes | `git checkout .` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |
| Merge branch | `git merge branch-name` |
| See diff | `git diff` |

## 📚 Learn More

- [Git Documentation](https://git-scm.com/doc)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Learn Git Branching](https://learngitbranching.js.org/)

## ✨ Your First Commit is Done!

Your initial commit includes:
- All 11 screen components
- Complete documentation
- Configuration files
- Git setup

You're now ready to make changes safely with version control!

---

**Next Steps:**
1. Make some changes to your code
2. Run `git status` to see what changed
3. Run `git add .` to stage changes
4. Run `git commit -m "Your message"` to save
5. Use `git log` to see your commit history

Happy coding with version control! 🚀
