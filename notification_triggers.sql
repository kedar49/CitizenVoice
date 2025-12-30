-- Create a function to create notifications for vote milestones
CREATE OR REPLACE FUNCTION create_vote_milestone_notification()
RETURNS TRIGGER AS $$
DECLARE
  vote_count INTEGER;
  milestone INTEGER;
  question_owner UUID;
  notification_msg TEXT;
BEGIN
  -- Get current vote count for the question
  SELECT COUNT(*) INTO vote_count
  FROM votes
  WHERE question_id = NEW.question_id;

  -- Get question owner
  SELECT user_id INTO question_owner
  FROM questions
  WHERE id = NEW.question_id;

  -- Check for milestones (10, 50, 100, 500, 1000)
  IF vote_count IN (10, 50, 100, 500, 1000) THEN
    notification_msg := 'Your question reached ' || vote_count || ' votes! 🎉';
    
    INSERT INTO notifications (user_id, question_id, type, message)
    VALUES (question_owner, NEW.question_id, 'vote_milestone', notification_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS vote_milestone_trigger ON votes;

-- Create trigger for vote milestones
CREATE TRIGGER vote_milestone_trigger
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION create_vote_milestone_notification();

-- Create a function to notify when question status changes
CREATE OR REPLACE FUNCTION notify_question_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_msg TEXT;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    notification_msg := 'Your question status changed to: ' || NEW.status;
    
    INSERT INTO notifications (user_id, question_id, type, message)
    VALUES (NEW.user_id, NEW.id, 'question_status', notification_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS question_status_change_trigger ON questions;

-- Create trigger for status changes
CREATE TRIGGER question_status_change_trigger
AFTER UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION notify_question_status_change();

-- Create a function to notify on role approval
CREATE OR REPLACE FUNCTION notify_role_approval()
RETURNS TRIGGER AS $$
DECLARE
  notification_msg TEXT;
BEGIN
  -- Only notify when status changes to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    IF NEW.status = 'approved' THEN
      notification_msg := 'Your request for ' || NEW.requested_role || ' access has been approved! ✅';
    ELSE
      notification_msg := 'Your request for ' || NEW.requested_role || ' access was not approved.';
    END IF;
    
    INSERT INTO notifications (user_id, question_id, type, message)
    VALUES (NEW.user_id, NULL, 'role_request', notification_msg);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS role_approval_trigger ON role_requests;

-- Create trigger for role approvals
CREATE TRIGGER role_approval_trigger
AFTER UPDATE ON role_requests
FOR EACH ROW
EXECUTE FUNCTION notify_role_approval();
