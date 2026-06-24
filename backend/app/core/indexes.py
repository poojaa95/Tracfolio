from app.core.db import get_db

async def create_indexes():
    db = get_db()
    
    # Users
    await db.users.create_index("google_id", unique=True)
    await db.users.create_index("email", unique=True)
    
    # Applications
    await db.applications.create_index("user_id")
    await db.applications.create_index("status")
    await db.applications.create_index("company")
    
    # Resume versions
    await db.resume_versions.create_index("user_id")
    
    # Interview questions
    await db.interview_questions.create_index("user_id")
    await db.interview_questions.create_index("topic")
    await db.interview_questions.create_index("company")
    
    # LeetCode stats
    await db.leetcode_stats.create_index("user_id", unique=True)
    
    print("Indexes created")