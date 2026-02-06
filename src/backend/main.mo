import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type StudentId = Text;
  var adminPassword : ?Text = ?"admin123"; // Default password on first install

  type Teacher = {
    principal : Principal.Principal;
    name : Text;
  };

  type Student = {
    id : StudentId;
    name : Text;
    course : Text;
  };

  type Question = {
    id : Text;
    text : Text;
    options : [Text];
    correctAnswerIndex : Nat;
  };

  type Quiz = {
    id : Text;
    title : Text;
    description : ?Text;
    questions : [Question];
    published : Bool;
    author : Principal.Principal;
  };

  type Answer = {
    questionId : Text;
    selectedOptionIndex : Nat;
    isCorrect : Bool;
    correctAnswerIndex : Nat;
  };

  type StudentAttempt = {
    quizId : Text;
    studentId : StudentId;
    studentName : Text;
    course : Text;
    score : Nat;
    answers : [Answer];
    timestamp : Int;
  };

  // Persistent storage for quizzes and attempts
  let quizzes = Map.empty<Text, Quiz>();
  let attempts = Map.empty<Text, StudentAttempt>();
  let teachers = Map.empty<Principal.Principal, Teacher>();

  func getStudentId(name : Text, course : Text) : StudentId {
    name.trim(#char ' ') # "__" # course.trim(#char ' ');
  };

  func getOrCreateStudent(name : Text, course : Text) : Student {
    let id = getStudentId(name, course);
    {
      id;
      name;
      course;
    };
  };

  //// PASSWORD AUTHENTICATION SYSTEM

  public type ChangePasswordRequest = {
    oldPassword : Text;
    newPassword : Text;
  };

  public type ChangePasswordResponse = {
    success : Bool;
    message : Text;
  };

  public type AdminActionResult = {
    success : Bool;
    message : Text;
  };

  public shared ({ caller }) func verifyAdminPassword(password : Text) : async Bool {
    adminPassword == ?password;
  };

  public shared ({ caller }) func changePassword(_ : Text, oldPassword : Text, newPassword : Text) : async ChangePasswordResponse {
    switch (adminPassword) {
      case (null) {
        { success = false; message = "Admin password not set" };
      };
      case (?currentPassword) {
        if (oldPassword.isEmpty() or newPassword.isEmpty()) {
          return { success = false; message = "Please fill out both old and new password" };
        };
        if (oldPassword != currentPassword) {
          return { success = false; message = "Old password is incorrect" };
        };
        if (newPassword.size() < 6) {
          return {
            success = false;
            message = "Password must be at least 6 characters";
          };
        };
        adminPassword := ?newPassword;
        { success = true; message = "Password changed successfully" };
      };
    };
  };

  func authenticateAdmin(password : Text) : AdminActionResult {
    switch (adminPassword) {
      case (null) {
        { success = false; message = "Admin password not set" };
      };
      case (?currentPassword) {
        if (password == currentPassword) {
          { success = true; message = "Authentication successful" };
        } else {
          { success = false; message = "Invalid password" };
        };
      };
    };
  };

  //// ADMIN FUNCTIONALITY

  public shared ({ caller }) func createQuiz(
    password : Text,
    title : Text,
    description : ?Text,
    questions : [Question],
  ) : async ?Text {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    let quizId = title # " - " # debug_show (questions.size());
    let quiz : Quiz = {
      id = quizId;
      title;
      description;
      questions;
      published = false;
      author = caller;
    };
    quizzes.add(quizId, quiz);
    ?quizId;
  };

  public shared ({ caller }) func updateQuiz(
    password : Text,
    quizId : Text,
    title : Text,
    description : ?Text,
    questions : [Question],
  ) : async AdminActionResult {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
      { success = false; message = "Unauthorized: Invalid password" };
    } else {
      switch (quizzes.get(quizId)) {
        case (null) { { success = false; message = "Quiz not found" } };
        case (?existingQuiz) {
          let updatedQuiz = {
            existingQuiz with
            title;
            description;
            questions;
          };
          quizzes.add(quizId, updatedQuiz);
          { success = true; message = "Quiz updated successfully" };
        };
      };
    };
  };

  public shared ({ caller }) func publishQuiz(password : Text, quizId : Text) : async AdminActionResult {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
      { success = false; message = "Unauthorized: Invalid password" };
    } else {
      switch (quizzes.get(quizId)) {
        case (null) {
          { success = false; message = "Quiz not found" };
        };
        case (?existingQuiz) {
          let updatedQuiz = {
            existingQuiz with
            published = true;
          };
          quizzes.add(quizId, updatedQuiz);
          { success = true; message = "Quiz published successfully" };
        };
      };
    };
  };

  public shared ({ caller }) func getTeacherQuizzes(password : Text) : async [Quiz] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    quizzes.values().toArray();
  };

  public shared ({ caller }) func getQuizResultsStats(
    password : Text,
    quizId : Text,
  ) : async {
    attempts : [StudentAttempt];
    attemptsByQuestion : [([Answer], Text)];
  } {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    let quizAttempts = attempts.values().toArray().filter(
      func(attempt) { attempt.quizId == quizId }
    );

    let attemptsByQuestion = switch (quizzes.get(quizId)) {
      case (null) { [] };
      case (?quiz) {
        quiz.questions.map(
          func(question) {
            let answersByQuestion = quizAttempts.map(
              func(attempt) {
                attempt.answers.filter(func(a) { a.questionId == question.id });
              }
            );
            let answers = answersByQuestion.concat<Answer>([]);
            (answers, question.id);
          }
        );
      };
    };

    {
      attempts = quizAttempts;
      attemptsByQuestion;
    };
  };

  public shared ({ caller }) func getAllQuizzes(password : Text) : async [Quiz] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    quizzes.values().toArray();
  };

  public shared ({ caller }) func getAllAttempts(password : Text) : async [StudentAttempt] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    attempts.values().toArray();
  };

  public shared ({ caller }) func getAttemptsForStudent(
    password : Text,
    name : Text,
    course : Text,
  ) : async [StudentAttempt] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    let studentId = getStudentId(name, course);
    attempts.values().toArray().filter(
      func(attempt) { attempt.studentId == studentId }
    );
  };

  public shared ({ caller }) func getStudentAttemptsByQuizId(
    password : Text,
    _quizId : Text,
  ) : async [StudentAttempt] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    attempts.values().toArray().filter(
      func(attempt) { attempt.quizId == _quizId }
    );
  };

  public shared ({ caller }) func getAttemptsByStudent(password : Text, _quizId : Text) : async [(Text, [Answer])] {
    let authResult = authenticateAdmin(password);
    if (not authResult.success) {
      Runtime.trap(authResult.message);
    };
    let attemptsByStudent = attempts.values().toArray().filter(
      func(attempt) { attempt.quizId == _quizId }
    );

    attemptsByStudent.map(
      func(attempt) {
        (attempt.studentId, attempt.answers);
      }
    );
  };

  //// STUDENT FUNCTIONALITY (No authentication required)

  public shared ({ caller }) func loginStudent(name : Text, course : Text) : async Student {
    getOrCreateStudent(name, course);
  };

  public query ({ caller }) func getPublishedQuizzes() : async [Quiz] {
    quizzes.values().toArray().filter(
      func(quiz) { quiz.published }
    );
  };

  public query ({ caller }) func getQuiz(quizId : Text) : async Quiz {
    switch (quizzes.get(quizId)) {
      case (null) {
        Runtime.trap("Quiz not found");
      };
      case (?quiz) {
        if (not quiz.published) {
          Runtime.trap("Unauthorized: Quiz is not published");
        };
        quiz;
      };
    };
  };

  public query ({ caller }) func hasAttemptedQuiz(studentId : Text, quizId : Text) : async Bool {
    let attemptId = studentId.concat(quizId);
    attempts.containsKey(attemptId);
  };

  public shared ({ caller }) func submitQuizAttempt(
    studentName : Text,
    course : Text,
    quizId : Text,
    answers : [(Text, Nat)],
  ) : async {
    score : Nat;
    answers : [Answer];
    isRetake : Bool;
    attempt : StudentAttempt;
  } {
    let studentId = getStudentId(studentName, course);
    let attemptId = studentId.concat(quizId);

    if (attempts.containsKey(attemptId)) {
      Runtime.trap("Quiz already attempted");
    };

    let questionMap = Map.empty<Text, Question>();
    switch (quizzes.get(quizId)) {
      case (null) {
        Runtime.trap("Quiz not found");
      };
      case (?quiz) {
        if (not quiz.published) {
          Runtime.trap("Quiz is not published");
        };
        for (q in quiz.questions.values()) {
          questionMap.add(q.id, q);
        };
      };
    };

    // Validate answers and compute score
    var score : Nat = 0;
    let processedAnswers = answers.map(func((questionId, selectedAnswerIndex)) {
      let question = switch (questionMap.get(questionId)) {
        case (null) {
          Runtime.trap("Question not found for ID: " # questionId);
        };
        case (?question) {
          if (selectedAnswerIndex >= question.options.size()) {
            Runtime.trap("Invalid answer index for question " # questionId);
          };
          if (selectedAnswerIndex == question.correctAnswerIndex) { score += 1 };
          question;
        };
      };

      {
        questionId;
        selectedOptionIndex = selectedAnswerIndex;
        isCorrect = selectedAnswerIndex == question.correctAnswerIndex;
        correctAnswerIndex = question.correctAnswerIndex;
      };
    });

    let attempt : StudentAttempt = {
      quizId;
      studentId;
      studentName;
      course;
      score;
      answers = processedAnswers;
      timestamp = Time.now();
    };

    attempts.add(attemptId, attempt);

    { score; answers = processedAnswers; isRetake = false; attempt };
  };
};
