-- Insert sample users
INSERT INTO user (name, email, password_hash) VALUES
  ('John Doe', 'john@example.com', '$2a$10$rJ7.Qh0qX9qX9qX9qX9qXe'),
  ('Jane Smith', 'jane@example.com', '$2a$10$rJ7.Qh0qX9qX9qX9qX9qXe');

-- Insert sample games
INSERT INTO game (name, creator_id) VALUES
  ('My First Game', 1),
  ('Adventure Game', 2);

-- Insert sample game iterations
INSERT INTO game_iteration (game_id, content) VALUES
  (1, '{"title":"Initial Version","description":"This is the first version of my game","settings":{"difficulty":"easy","maxPlayers":4}}'),
  (1, '{"title":"Updated Version","description":"Added new features and improved gameplay","settings":{"difficulty":"medium","maxPlayers":6}}'),
  (2, '{"title":"Adventure Game v1","description":"An exciting adventure game with multiple levels","settings":{"difficulty":"hard","maxPlayers":2}}'); 