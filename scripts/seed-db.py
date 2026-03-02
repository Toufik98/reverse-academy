#!/usr/bin/env python3
"""Seed the local.db with learning paths, steps, and achievements from content JSON."""

import json
import os
import sqlite3
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE, "frontend", "src", "content", "en")
DB_PATH = os.path.join(BASE, "rust-api", "local.db")

def seed():
    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        print("Start the Rust API first to run migrations, then re-run this script.")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ------- Learning Paths & Steps -------
    paths_dir = os.path.join(CONTENT_DIR, "paths")
    path_files = sorted(f for f in os.listdir(paths_dir) if f.endswith(".json"))
    
    total_paths = 0
    total_steps = 0

    for pf in path_files:
        with open(os.path.join(paths_dir, pf)) as f:
            data = json.load(f)

        path_id = data["id"]
        
        # Check if already seeded
        cur.execute("SELECT id FROM learning_paths WHERE id = ?", (path_id,))
        if cur.fetchone():
            print(f"  SKIP path '{path_id}' (already exists)")
            continue

        cur.execute("""
            INSERT INTO learning_paths (id, slug, title, domain, mode, difficulty, description, estimated_minutes, xp_reward)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            path_id,
            data["slug"],
            data["title"],
            data["domain"],
            data["mode"],
            data["difficulty"],
            data["description"],
            data.get("estimatedMinutes", 30),
            data.get("xpReward", 0),
        ))
        total_paths += 1
        print(f"  + path '{path_id}' ({data['title']})")

        for step in data["steps"]:
            # Use compound ID: pathId/stepId to make step IDs globally unique
            step_id = f"{path_id}/{step['id']}"
            content_json = json.dumps(step.get("content", {}))
            hint = step.get("hint") or step.get("content", {}).get("hint", "") or None

            cur.execute("""
                INSERT INTO steps (id, path_id, order_index, title, step_type, content_json, hint, xp_reward)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                step_id,
                path_id,
                step["order"],
                step["title"],
                step["type"],
                content_json,
                hint,
                step.get("xpReward", 10),
            ))
            total_steps += 1

        print(f"    + {len(data['steps'])} steps")

    # ------- Achievements -------
    ach_file = os.path.join(CONTENT_DIR, "achievements.json")
    total_achievements = 0

    if os.path.exists(ach_file):
        with open(ach_file) as f:
            achievements = json.load(f)

        for ach in achievements:
            ach_id = ach["id"]
            cur.execute("SELECT id FROM achievements WHERE id = ?", (ach_id,))
            if cur.fetchone():
                print(f"  SKIP achievement '{ach_id}' (already exists)")
                continue

            cur.execute("""
                INSERT INTO achievements (id, slug, title, description, icon, criteria_json, xp_reward)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                ach_id,
                ach["slug"],
                ach["title"],
                ach.get("description", ""),
                ach.get("icon", "trophy"),
                ach.get("criteriaJson", "{}"),
                ach.get("xpBonus", 0),
            ))
            total_achievements += 1
            print(f"  + achievement '{ach_id}' ({ach['title']})")
    else:
        print("  WARN: achievements.json not found, skipping")

    conn.commit()
    conn.close()

    print(f"\nDone! Seeded {total_paths} paths, {total_steps} steps, {total_achievements} achievements.")

if __name__ == "__main__":
    print(f"Seeding database at {DB_PATH}...\n")
    seed()
