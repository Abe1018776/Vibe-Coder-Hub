import paramiko

HOST = "76.13.102.245"
USER = "root"
PASS = "uqArCmnO5(pIb4vtH4pJ"

SQL = r"""
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    created_by TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    prize_amount REAL NOT NULL,
    deadline TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    loom_url TEXT,
    reference_urls TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    public_slug TEXT NOT NULL UNIQUE,
    winner_submission_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE competitions OWNER TO vibe;

CREATE TABLE IF NOT EXISTS competition_submissions (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    submitter_name TEXT NOT NULL,
    submitter_email TEXT,
    submitter_user_id TEXT,
    submission_url TEXT NOT NULL,
    loom_url TEXT,
    description TEXT,
    thread_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE competition_submissions OWNER TO vibe;
"""


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS, timeout=20)
    cmd = (
        "sudo -u postgres psql -d vibe_coder_hub -v ON_ERROR_STOP=1 <<'EOF'\n"
        + SQL
        + "\nEOF\n"
    )
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode()
    err = stderr.read().decode()
    rc = stdout.channel.recv_exit_status()
    client.close()
    print("rc=", rc)
    print("stdout:", out)
    print("stderr:", err)


if __name__ == "__main__":
    main()
