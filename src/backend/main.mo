import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import P "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  type StudentId = Text;

  type Teacher = {
    principal : P.Principal;
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
    author : P.Principal;
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
  let teachers = Map.empty<P.Principal, Teacher>();

  func getStudentId(name : Text, course : Text) : StudentId {
    name.trim(#char ' ') # "__" # course.trim(#char ' ');
  };

  func getOrCreateStudent(name : Text, course : Text) : Student {
    let id = getStudentId(name, course);
    {
      id;
      name : Text;
      course : Text;
    };
  };

  func ensureAdminOrTeacher(caller : P.Principal) {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin or #user) { () };
      case (#guest) {
        Runtime.trap("Unauthorized: Only teachers/admins can perform this action");
      };
    };
  };

  //// Teacher/Admin Functions

  public shared ({ caller }) func registerTeacher(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as teachers");
    };
    if (teachers.containsKey(caller)) {
      Runtime.trap("Teacher already registered");
    };
    let teacher : Teacher = {
      principal = caller;
      name;
    };
    teachers.add(caller, teacher);
  };

  public shared ({ caller }) func createQuiz(
    title : Text,
    description : ?Text,
    questions : [Question],
  ) : async Text {
    ensureAdminOrTeacher(caller);
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
    quizId;
  };

  public shared ({ caller }) func updateQuiz(
    quizId : Text,
    title : Text,
    description : ?Text,
    questions : [Question],
  ) : async () {
    ensureAdminOrTeacher(caller);
    switch (quizzes.get(quizId)) {
      case (null) {
        Runtime.trap("Quiz not found");
      };
      case (?existingQuiz) {
        if (existingQuiz.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not the author of this quiz");
        };
        let updatedQuiz = {
          existingQuiz with
          title;
          description;
          questions;
        };
        quizzes.add(quizId, updatedQuiz);
      };
    };
  };

  public shared ({ caller }) func publishQuiz(quizId : Text) : async () {
    ensureAdminOrTeacher(caller);
    switch (quizzes.get(quizId)) {
      case (null) {
        Runtime.trap("Quiz not found");
      };
      case (?existingQuiz) {
        if (existingQuiz.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not the author of this quiz");
        };
        let updatedQuiz = {
          existingQuiz with
          published = true;
        };
        quizzes.add(quizId, updatedQuiz);
      };
    };
  };

  public query ({ caller }) func getTeacherQuizzes() : async [Quiz] {
    ensureAdminOrTeacher(caller);
    let iter = quizzes.values();
    let teacherQuizzes = iter.filter(func(quiz) { quiz.author == caller });
    teacherQuizzes.toArray();
  };

  public query ({ caller }) func getQuiz(quizId : Text) : async Quiz {
    switch (quizzes.get(quizId)) {
      case (null) {
        Runtime.trap("Quiz not found");
      };
      case (?quiz) {
        // Teachers/admins can view any quiz
        // Students can only view published quizzes
        let role = AccessControl.getUserRole(accessControlState, caller);
        switch (role) {
          case (#admin or #user) { quiz };
          case (#guest) {
            if (not quiz.published) {
              Runtime.trap("Unauthorized: Quiz is not published");
            };
            quiz;
          };
        };
      };
    };
  };

  public query ({ caller }) func getQuizResultsStats(quizId : Text) : async {
    attempts : [StudentAttempt];
    attemptsByQuestion : [([Answer], Text)];
  } {
    ensureAdminOrTeacher(caller);
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

  //// Student Functions (No authentication required)

  public shared ({ caller }) func loginStudent(name : Text, course : Text) : async Student {
    getOrCreateStudent(name, course);
  };

  public query ({ caller }) func getPublishedQuizzes() : async [Quiz] {
    let unfilteredPublishedQuizzes = quizzes.values().toArray().filter(
      func(quiz) { quiz.published }
    );
    unfilteredPublishedQuizzes;
  };

  public query ({ caller }) func getStudentAttemptsByQuizId(_quizId : Text) : async [StudentAttempt] {
    ensureAdminOrTeacher(caller);
    let unfilteredAttempts = attempts.values().toArray().filter(
      func(attempt) {
        attempt.quizId == _quizId;
      }
    );
    unfilteredAttempts;
  };

  public query ({ caller }) func hasAttemptedQuiz(studentId : Text, quizId : Text) : async Bool {
    let attemptId = studentId.concat(quizId);
    attempts.containsKey(attemptId);
  };

  public shared ({ caller }) func submitQuizAttempt(
    studentName : Text,
    course : Text,
    quizId : Text,
    answers : [(Text, Nat)], // questionId and selectedOptionIndex
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
      timestamp = 0;
    };

    attempts.add(attemptId, attempt);

    { score; answers = processedAnswers; isRetake = false; attempt };
  };

  //// System-level query APIs (Teacher/Admin only)

  public query ({ caller }) func getAllQuizzes() : async [Quiz] {
    ensureAdminOrTeacher(caller);
    quizzes.values().toArray();
  };

  public query ({ caller }) func getAllAttempts() : async [StudentAttempt] {
    ensureAdminOrTeacher(caller);
    let allAttempts = attempts.values().toArray();
    allAttempts;
  };

  public query ({ caller }) func getAttemptsForStudent(name : Text, course : Text) : async [StudentAttempt] {
    ensureAdminOrTeacher(caller);
    let studentId = getStudentId(name, course);
    let unfilteredStudentAttempts = attempts.values().toArray().filter(
      func(attempt) { attempt.studentId == studentId }
    );
    unfilteredStudentAttempts;
  };

  public query ({ caller }) func getAttemptsByStudent(_quizId : Text) : async [(Text, [Answer])] {
    ensureAdminOrTeacher(caller);
    let attemptsByStudent = attempts.values().toArray().filter(
      func(attempt) { attempt.quizId == _quizId }
    );

    let results = attemptsByStudent.map(
      func(attempt) {
        (attempt.studentId, attempt.answers);
      }
    );

    results;
  };
};
