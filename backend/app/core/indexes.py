from app.core.db import get_db

async def create_indexes():
    db = get_db()

    # Users — google_id sparse unique (ignores null values)
    try:
        await db.users.drop_index("google_id_1")
    except Exception:
        pass
    try:
        await db.users.create_index("google_id", unique=True, sparse=True)
    except Exception as e:
        print(f"Warning: Could not create google_id index: {e}")
        print("This is non-fatal — server will continue.")

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