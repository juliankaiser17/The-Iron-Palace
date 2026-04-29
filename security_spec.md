rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global Deny
    match /{document=**} { allow read, write: if false; }

    // Hardened Helpers
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
    function isSignedIn() { return request.auth != null; }
    function getEmailVerified() { return request.auth.token.email_verified == true; }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    
    // Auth Integrity
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    
    // Relational Helper: Is the current user the coach of the athlete at 'uid'?
    function isCoachOf(athleteUid) {
      let palaceId = get(/databases/$(database)/documents/users/$(athleteUid)).data.palaceId;
      return palaceId != null && get(/databases/$(database)/documents/palaces/$(palaceId)).data.coachUid == request.auth.uid;
    }

    match /users/{uid} {
      allow get: if isSignedIn(); // Profiles are semi-public for coaches/lookup
      allow list: if isSignedIn() && (request.auth.uid == uid || exists(/databases/$(database)/documents/users/$(request.auth.uid))); 
      
      allow create: if isOwner(uid) && isValidUserProfile(incoming()) && incoming().uid == uid;
      allow update: if isOwner(uid) && isValidUserProfile(incoming()) && 
                    incoming().diff(existing()).affectedKeys().hasOnly(['name', 'sport', 'weight', 'palaceId', 'updatedAt']);

      function isValidUserProfile(data) {
        return data.uid == request.auth.uid &&
               data.email is string && data.email.size() <= 100 &&
               data.role in ['athlete', 'coach'] &&
               data.name is string && data.name.size() <= 64;
      }

      match /workouts/{workoutId} {
        allow get: if isOwner(uid) || isCoachOf(uid);
        allow list: if isOwner(uid) || isCoachOf(uid);
        allow create: if isOwner(uid) && isValidWorkout(incoming());
        allow delete: if isOwner(uid);

        function isValidWorkout(data) {
          return data.athleteUid == request.auth.uid &&
                 data.volume is number && data.volume <= 100000 &&
                 data.calories is number &&
                 data.ts is number;
        }
      }

      match /recovery/{logId} {
        allow get: if isOwner(uid) || isCoachOf(uid);
        allow list: if isOwner(uid) || isCoachOf(uid);
        allow create: if isOwner(uid) && isValidRecovery(incoming());

        function isValidRecovery(data) {
          return data.athleteUid == request.auth.uid &&
                 data.score is number && data.score >= 0 && data.score <= 100 &&
                 data.ts is number;
        }
      }

      match /pain_logs/{logId} {
        allow get: if isOwner(uid) || isCoachOf(uid);
        allow list: if isOwner(uid) || isCoachOf(uid);
        allow create: if isOwner(uid) && isValidPainLog(incoming());
        allow delete: if isOwner(uid);

        function isValidPainLog(data) {
          return data.athleteUid == request.auth.uid &&
                 data.intensity is number && data.intensity >= 1 && data.intensity <= 10 &&
                 data.part is string && data.part.size() <= 50 &&
                 data.type in ['sharp', 'dull'] &&
                 data.ts is number;
        }
      }
    }

    match /palaces/{palaceId} {
      allow get: if isSignedIn();
      allow list: if isSignedIn() && (resource.data.coachUid == request.auth.uid || resource.data.inviteCode == request.query.inviteCode);
      
      allow create: if isSignedIn() && isValidPalace(incoming());
      allow update: if isSignedIn() && (
        // Action: Coach update members or name
        (existing().coachUid == request.auth.uid && incoming().diff(existing()).affectedKeys().hasOnly(['name', 'members'])) ||
        // Action: Athlete Join (only adding self to members)
        (incoming().diff(existing()).affectedKeys().hasOnly(['members'])) 
      );

      function isValidPalace(data) {
        return data.coachUid == request.auth.uid &&
               data.name is string && data.name.size() <= 64 &&
               data.inviteCode is string && data.inviteCode.size() <= 10;
      }
    }
  }
}
