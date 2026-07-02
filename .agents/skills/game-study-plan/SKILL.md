---
name: game-study-plan
description: This skill should be used when the user asks for a game-ified study plan or vacation learning plan for Chinese students, especially primary-to-middle school transition. It generates an interactive HTML page with level-based progression, XP, badges, and subject tasks.
agent_created: true
---

# Game Study Plan

## Overview

When a user asks for a game-like study plan (e.g., 小升初暑假学习计划、闯关模式), generate an interactive HTML file that turns the schedule into a game.

## Workflow

1. Determine the target region, grade level, duration, and subjects.
2. Design 6-8 themed "worlds" or "levels". Each level contains 5-6 daily task cards.
3. Assign XP to each task, weekly BOSS challenges, and a final boss.
4. Build a single HTML/CSS/JS page with checkboxes, localStorage progress tracking, level/XP/badges display, and print styles.
5. Add local flavor if a city is known (e.g., 南京 history, attractions, local culture).
6. Save the file in the workspace and present it.

## Output Format

- One self-contained `.html` file in the project workspace.
- Light theme, responsive grid, Chinese UI.
- XP per task; level = XP // 500 + 1; badges at XP milestones.

## Tips

- Balance 语文, 数学, 英语, and integrated subjects (science, humanities, arts, PE, labor).
- Keep daily tasks around 2 hours total.
- Include a printable daily schedule template and optional local activities.
- Use a Python generator to keep the HTML structure maintainable.
