# sequence-basic

A login sequence across three participants: **Alice**, **Bob** (an auth service),
and **DB**.

Expected, top to bottom:

1. Alice → Bob: `login(user, pass)` — solid line, filled triangle head.
2. Bob → DB: `SELECT * FROM users` — solid line, filled triangle head.
3. DB ⇢ Bob: `row` — dashed return, open head.
4. Bob ⇢ Alice: `token` — dashed return, open head.

Three vertical dashed lifelines hang under the three participant boxes.
Messages are horizontal, evenly spaced, in the order above. Return messages
point back to the left.
