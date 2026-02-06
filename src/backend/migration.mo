import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Types matching existing persistent data
  type Quiz = {
    id : Text;
    title : Text;
    description : ?Text;
    questions : [Question];
    published : Bool;
    author : Principal.Principal;
  };

  type Question = {
    id : Text;
    text : Text;
    options : [Text];
    correctAnswerIndex : Nat;
  };

  type Answer = {
    questionId : Text;
    selectedOptionIndex : Nat;
    isCorrect : Bool;
    correctAnswerIndex : Nat;
  };

  type StudentAttempt = {
    quizId : Text;
    studentId : Text;
    studentName : Text;
    course : Text;
    score : Nat;
    answers : [Answer];
    timestamp : Int;
  };

  // Actor state matching the persistent data
  type OldActor = {
    quizzes : Map.Map<Text, Quiz>;
    attempts : Map.Map<Text, StudentAttempt>;
    teachers : Map.Map<Principal.Principal, { principal : Principal.Principal; name : Text }>;
  };

  type NewActor = {
    quizzes : Map.Map<Text, Quiz>;
    attempts : Map.Map<Text, StudentAttempt>;
    teachers : Map.Map<Principal.Principal, { principal : Principal.Principal; name : Text }>;
    adminPassword : ?Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      quizzes = old.quizzes;
      attempts = old.attempts;
      teachers = old.teachers;
      adminPassword = ?"admin123"; // Default password for upgrades
    };
  };
};
