-- +goose Up
-- +goose StatementBegin
CREATE TABLE post_requirements (
    requirementId TEXT NOT NULL PRIMARY KEY,
    postId TEXT NOT NULL,
    requirementType TEXT CHECK(requirementType IN ('responsibility', 'qualification')) NOT NULL,
    requirement TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(postId)
);

CREATE INDEX idx_post_requirements_postId ON post_requirements(postId);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_post_requirements_postId;

DROP TABLE post_requirements;
-- +goose StatementEnd
