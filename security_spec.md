# Security Specification & Payload-First TDD

## 1. Data Invariants
1. **Authentication & Verification**: Only authenticated users with `request.auth.token.email_verified == true` and an `@gonzales.k12.ca.us` email address may read or write any pacing data.
2. **Strict Schema Enforcement**: Every document in `calendars`, `standards`, `entries`, and `admins` must pass strict `hasAll` and `hasOnly` key checks, exact type checks, and explicit string/list `.size()` bounds. No shadow/ghost fields are permitted.
3. **Referential Integrity**: Every `standards` and `entries` document created must reference an existing parent document in `/calendars/{calendarId}` (`exists(...)`) and match `schoolYear == '2026-2027'`.
4. **Immutable Ownership & Temporal Integrity**: `updatedAt` and `createdAt` must strictly equal `request.time`. `updatedByUid` must strictly equal `request.auth.uid`. Parent keys (`calendarId`, `date`, `schoolYear`) cannot be mutated across documents on update.
5. **Admin Privilege Boundaries**: Only verified admins (`pdietrich@gonzales.k12.ca.us` or `/admins/{uid}`) may create custom calendars outside the 22 pre-seeded IDs, delete calendars, or grant/revoke admin records. Regular staff cannot self-escalate to `/admins/{uid}`.
6. **Query Enforcer**: All `list` operations enforce `resource.data.schoolYear == '2026-2027'` directly in the rule (no blanket `allow read: if isSignedIn()`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Read/Write**: Unauthenticated request attempting `get` or `create` on `/entries/6th-grade-math__2026-09-14`.
2. **Unverified Email Spoofing**: Authenticated user with `email_verified: false` claiming admin email `pdietrich@gonzales.k12.ca.us`.
3. **Self-Admin Privilege Escalation**: Non-admin staff member attempting `create` on `/admins/{theirUid}` to grant themselves admin rights.
4. **Shadow / Ghost Field Injection**: Staff creating a standard with an extra `isApproved: true` field not in `hasOnly`.
5. **Orphaned Standard Creation**: Staff creating a standard pointing to `calendarId: "non-existent-course"`.
6. **Orphaned Entry Creation**: Staff creating an entry pointing to `calendarId: "fake-calendar"`.
7. **Timestamp Forgery**: Staff writing `updatedAt: new Date('2020-01-01')` instead of `request.time`.
8. **Author UID Spoofing**: Staff writing `updatedByUid: "another-teacher-uid"` instead of `request.auth.uid`.
9. **ID Poisoning / Denial of Wallet**: Staff writing a 500-character document ID or 5,000-character `topic` string on an entry.
10. **Invalid Enum Injection**: Staff setting standard `type: "super-essential"` or `ngssModel: "invalid"`.
11. **Unbounded Array Injection**: Staff writing an entry with 50 `standardIds` (exceeding max 30) or non-string array element `[123]`.
12. **Blanket Unscoped List Query**: Client querying `collection(db, 'entries')` without `where('schoolYear', '==', '2026-2027')`.
