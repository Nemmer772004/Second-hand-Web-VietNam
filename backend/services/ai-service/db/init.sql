-- Active: 1760082733285@@127.0.0.1@5432@secondhand_ai
-- Initial schema for AI service events & recommendations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ai_recommendations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    recommended_product_ids text[] NOT NULL,
    context jsonb NOT NULL DEFAULT '{}',
    model varchar(100) NOT NULL,
    confidence double precision NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_recommendations_updated_at ON ai_recommendations;
CREATE TRIGGER trg_ai_recommendations_updated_at
BEFORE UPDATE ON ai_recommendations
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE TABLE IF NOT EXISTS ai_interaction_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id varchar(128),
    session_id varchar(64),
    product_id varchar(64),
    event_type varchar(32) NOT NULL,
    step_number integer NOT NULL,
    delta_seconds double precision NOT NULL DEFAULT 0,
    reward double precision NOT NULL DEFAULT 0,
    done boolean NOT NULL DEFAULT false,
    metadata jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uniq_session_step UNIQUE (session_id, step_number)
);

DROP TRIGGER IF EXISTS trg_ai_interaction_events_updated_at ON ai_interaction_events;
CREATE TRIGGER trg_ai_interaction_events_updated_at
BEFORE UPDATE ON ai_interaction_events
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_ai_interaction_events_user_occurred_at
    ON ai_interaction_events (user_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_ai_interaction_events_session
    ON ai_interaction_events (session_id);

CREATE TABLE IF NOT EXISTS ai_session_sequences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id varchar(128),
    session_id varchar(64) UNIQUE NOT NULL,
    started_at timestamptz NOT NULL,
    completed_at timestamptz,
    length integer NOT NULL DEFAULT 0,
    action_sequence varchar[] NOT NULL DEFAULT '{}',
    product_sequence varchar[] NOT NULL DEFAULT '{}',
    time_sequence double precision[] NOT NULL DEFAULT '{}',
    reward_sequence double precision[] NOT NULL DEFAULT '{}',
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_ai_session_sequences_updated_at ON ai_session_sequences;
CREATE TRIGGER trg_ai_session_sequences_updated_at
BEFORE UPDATE ON ai_session_sequences
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_ai_session_sequences_user
    ON ai_session_sequences (user_id);

CREATE TABLE IF NOT EXISTS ai_rl_episode_steps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id varchar(128) NOT NULL,
    user_id varchar(128),
    step_number integer NOT NULL,
    state jsonb NOT NULL,
    action varchar(64) NOT NULL,
    reward double precision NOT NULL DEFAULT 0,
    next_state jsonb,
    done boolean NOT NULL DEFAULT false,
    metadata jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uniq_episode_step UNIQUE (episode_id, step_number)
);

DROP TRIGGER IF EXISTS trg_ai_rl_episode_steps_updated_at ON ai_rl_episode_steps;
CREATE TRIGGER trg_ai_rl_episode_steps_updated_at
BEFORE UPDATE ON ai_rl_episode_steps
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_timestamp();

CREATE INDEX IF NOT EXISTS idx_ai_rl_episode_steps_episode
    ON ai_rl_episode_steps (episode_id);
