---
layout: default
title: "Login System: AP CSP Component A Requirements"
description: "Documentation demonstrating how the dual-database authentication system meets all AP Computer Science Principles Component A requirements"
---

# Login System: AP CSP Component A Requirements

## Overview
This document demonstrates how the dual-database authentication system meets all AP Computer Science Principles Component A (Program Code Requirements).

---

## Requirement 1: Instructions for Input

**Requirement:** Instructions for input from one of the following: the user, a device, an online data stream, or a file

**Implementation:**

```python
username = request.form['username']
password = request.form['password']
```

**Explanation:**
- User enters credentials through HTML form
- User actions (clicking login button) trigger authentication event
- Input is captured from POST request form data

---

## Requirement 2: Use of a List or Collection Type

**Requirement:** Use of at least one list (or other collection type) to represent a collection of data that is stored and used to manage program complexity

**Implementation:**

```python
# Database tables are collections of user objects
user = User.query.filter_by(_uid=username).first()

# Quest database also contains collection of users
quest_user = check_quest_user(username, password)
```

**Explanation:**
- Database tables (`User` and `QuestUser`) store collections of user records
- Each query operates on these collections to find matching entries
- Collections manage complexity by organizing multiple user accounts with their credentials and metadata

**Explicit Collection Example:**

```python
# All users in main database (collection)
all_users = User.query.all()

# All users in Quest database (collection)
all_quest_users = QuestUser.query.all()
```

### Database Schema Architecture

The dual-database authentication system integrates with a comprehensive relational database structure designed for the parallel computing education platform:

![Database Schema Diagram]({{ site.baseurl }}/images/DBflow.png)

**Schema Overview:**

The database architecture consists of six interconnected tables that support user authentication, progress tracking, and educational content management:

**Core Authentication Tables:**
- **users** - Main user authentication table storing credentials and profile information
- **room_members** - Junction table linking users to educational rooms they've joined

**Progress Tracking Tables:**
- **user_progress** - Individual student progress through course modules and lessons
- **room_progress** - Aggregate progress metrics for entire classroom groups

**Content Management Tables:**
- **rooms** - Educational spaces (classrooms/courses) containing lessons and members
- **glossary** - Technical terminology and definitions for parallel computing concepts

**Table Relationships:**

The schema implements several key relationships demonstrating collection types:

1. **Users → Rooms** (Many-to-Many via room_members)
   - Students can join multiple rooms (collection of rooms per user)
   - Rooms can contain multiple students (collection of users per room)
   - Enables classroom-based learning groups

2. **Rooms → User Progress** (One-to-Many)
   - Each room contains a collection of user progress records
   - Supports personalized learning paths within group contexts

3. **Rooms → Room Progress** (One-to-Many)
   - Collection of aggregate progress metrics for instructor dashboards
   - Tracks overall classroom advancement

4. **Rooms → Glossary** (One-to-Many)
   - Collection of context-specific terminology for each course module
   - Educational reference material tied to curriculum

**Authentication Integration:**

The dual-database system extends this schema by:
- Maintaining the **users** table as the primary authentication collection
- Querying the legacy Quest database collection when users aren't found in the main system
- Automatically synchronizing Quest users into the **users** collection upon first login
- Preserving all relational integrity with room_members and progress tracking collections

This architecture demonstrates how collections manage program complexity by organizing users, rooms, progress records, and educational content into structured, queryable tables that support the authentication system and broader platform functionality.

---

## Requirement 3: At Least One Procedure

**Requirement:** At least one procedure that contributes to the program's intended purpose, with defined name, return type, and parameters

**Implementation:**

### Procedure 1: `check_quest_user`

```python
def check_quest_user(username, password):
    """Query Quest database for user credentials"""
    # Parameters: username (string), password (string)
    # Return type: QuestUser object or None
    
    quest_db_users = QuestUser.query.all()
    
    for user in quest_db_users:
        if user.username == username and user.verify_password(password):
            return user
    
    return None
```

- **Name:** `check_quest_user`
- **Parameters:** `username`, `password`
- **Return type:** `QuestUser` object or `None`
- **Purpose:** Authenticates user against Quest legacy database

### Procedure 2: `sync_quest_user_to_main`

```python
def sync_quest_user_to_main(quest_user, password):
    """Create user in main database from Quest data"""
    # Parameters: quest_user (QuestUser object), password (string)
    # Return type: User object or None
    
    try:
        new_user = User(
            _uid=quest_user.username,
            _name=quest_user.name,
            _password=password
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user
    except:
        db.session.rollback()
        return None
```

- **Name:** `sync_quest_user_to_main`
- **Parameters:** `quest_user`, `password`
- **Return type:** `User` object or `None`
- **Purpose:** Migrates Quest user to main database on first login

---

## Requirement 4: Algorithm with Sequencing, Selection, and Iteration

**Requirement:** An algorithm that includes sequencing, selection, and iteration

**Implementation:**

### Full Algorithm in `login()` function:

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    next_page = request.args.get('next', '') or request.form.get('next', '')
    
    if request.method == 'POST':
        # SEQUENCING: Steps execute in order
        username = request.form['username']
        password = request.form['password']
        
        # Step 1: Check main database
        user = User.query.filter_by(_uid=username).first()
        
        # SELECTION: Conditional branches
        if user and user.is_password(password):
            # Main database authentication successful
            login_user(user)
            if not is_safe_url(next_page):
                return abort(400)
            return redirect(next_page or url_for('index'))
        
        # Step 2: Check Quest database if main auth fails
        quest_user = check_quest_user(username, password)
        
        if quest_user:
            # Quest user found - sync to main database
            synced_user = sync_quest_user_to_main(quest_user, password)
            
            if synced_user:
                login_user(synced_user)
                if not is_safe_url(next_page):
                    return abort(400)
                return redirect(next_page or url_for('index'))
            else:
                error = 'Error syncing user account. Please try again.'
        else:
            error = 'Invalid username or password.'
    
    return render_template("login.html", error=error, next=next_page)
```

### Breaking Down the Algorithm:

#### SEQUENCING

Steps execute in order:
1. Get username and password from form
2. Query main database for user
3. Validate credentials
4. If not found, query Quest database
5. Sync user if found in Quest
6. Log in user and redirect

#### SELECTION

Multiple conditional branches:
- `if request.method == 'POST'` - Check if form submitted
- `if user and user.is_password(password)` - Validate main database credentials
- `if quest_user` - Check if Quest user exists
- `if synced_user` - Verify sync succeeded
- `if not is_safe_url(next_page)` - Security check

#### ITERATION

Database queries iterate through records:

```python
# When this line executes:
user = User.query.filter_by(_uid=username).first()

# Behind the scenes (conceptual):
for each_user in user_database:
    if each_user._uid == username:
        return each_user
return None
```

**Explicit iteration in `check_quest_user`:**

```python
def check_quest_user(username, password):
    quest_db_users = QuestUser.query.all()
    
    # ITERATION: Loop through Quest database users
    for user in quest_db_users:
        if user.username == username and user.verify_password(password):
            return user
    
    return None
```

**The login system iterates through:**
1. Main database User table to find matching `_uid`
2. Quest database QuestUser table to find matching `username`
3. Both iterations search until a match is found or all records are checked

---

## Requirement 5: Calls to Student-Developed Procedure

**Requirement:** Calls to your student-developed procedure

**Implementation:**

```python
# Call to check_quest_user procedure
quest_user = check_quest_user(username, password)

# Call to sync_quest_user_to_main procedure
synced_user = sync_quest_user_to_main(quest_user, password)
```

**Both procedures are:**
- Defined by student
- Called within main login algorithm
- Essential to program functionality
- Used to manage dual-database complexity

---

## Requirement 6: Instructions for Output

**Requirement:** Instructions for output (tactile, audible, visual, or textual) based on input and program functionality

**Implementation:**

### Success Output:

```python
login_user(user)
return redirect(next_page or url_for('index'))
```

- **Visual output:** Redirects to authenticated page
- **Based on input:** Successful username/password combination

### Error Output:

```python
error = 'Invalid username or password.'
return render_template("login.html", error=error, next=next_page)
```

- **Visual/textual output:** Error message displayed to user
- **Based on input:** Failed authentication attempt

### Sync Error Output:

```python
error = 'Error syncing user account. Please try again.'
return render_template("login.html", error=error, next=next_page)
```

- **Visual/textual output:** Specific sync failure message
- **Based on program functionality:** Failed database synchronization

---

## Summary: All Requirements Met

| Requirement | Implementation | ✓ |
|------------|----------------|---|
| Input from user | Form data (username, password) | ✅ |
| List/collection | Database tables (User, QuestUser) | ✅ |
| Procedure with parameters | check_quest_user(), sync_quest_user_to_main() | ✅ |
| Sequencing | Steps execute in order | ✅ |
| Selection | Multiple if/else branches | ✅ |
| Iteration | Database queries loop through records | ✅ |
| Procedure calls | Both procedures called in login flow | ✅ |
| Output based on input | Error messages and redirects | ✅ |

---

## Database Schema Architecture

The dual-database authentication system integrates with a comprehensive relational database structure designed for the parallel computing education platform:

![Database Schema Diagram](image.png)

### Schema Overview

The database architecture consists of six interconnected tables that support user authentication, progress tracking, and educational content management:

**Core Authentication Tables:**
- **users** - Main user authentication table storing credentials and profile information
- **room_members** - Junction table linking users to educational rooms they've joined

**Progress Tracking Tables:**
- **user_progress** - Individual student progress through course modules and lessons
- **room_progress** - Aggregate progress metrics for entire classroom groups

**Content Management Tables:**
- **rooms** - Educational spaces (classrooms/courses) containing lessons and members
- **glossary** - Technical terminology and definitions for parallel computing concepts

### Table Relationships

The schema implements several key relationships:

1. **Users → Rooms** (Many-to-Many via room_members)
   - Students can join multiple rooms
   - Rooms can contain multiple students
   - Enables classroom-based learning groups

2. **Rooms → User Progress** (One-to-Many)
   - Each room tracks individual student progress
   - Supports personalized learning paths within group contexts

3. **Rooms → Room Progress** (One-to-Many)
   - Aggregate metrics for instructor dashboards
   - Tracks overall classroom advancement

4. **Rooms → Glossary** (One-to-Many)
   - Context-specific terminology for each course module
   - Educational reference material tied to curriculum

### Authentication Integration

The dual-database system extends this schema by:
- Maintaining the **users** table as the primary authentication source
- Querying the legacy Quest database when users aren't found in the main system
- Automatically synchronizing Quest users into the **users** table upon first login
- Preserving all relational integrity with room_members and progress tracking tables

This architecture ensures seamless migration from the legacy system while maintaining full access to the platform's educational features and progress tracking capabilities.



**Intended Purpose:**
The dual-database authentication system allows users to log in to the parallel computing education platform using credentials from either the main application database or the legacy Quest database, with automatic synchronization on first login.

**How Requirements Support Purpose:**
- **Input:** Captures user credentials
- **Collections:** Manages multiple user accounts across two databases
- **Procedures:** Modularizes authentication and sync logic
- **Algorithm:** Implements fallback authentication with migration
- **Output:** Provides appropriate feedback and navigation