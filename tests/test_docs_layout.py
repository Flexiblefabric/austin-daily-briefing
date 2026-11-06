"""Unit coverage for documentation folder-convention enforcement."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from check_docs_layout import APPROVED_ROOT_FILES, validate_layout  # noqa: E402


class DocsLayoutTests(unittest.TestCase):
    def setUp(self):
        self.valid_paths = [
            "docs/README.md",
            "docs/editorial-system.md",
            "docs/automation-prompts/README.md",
            "docs/automation-prompts/austin-daily-briefing.md",
            "docs/editorial/README.md",
            "docs/editorial/evidence/README.md",
            "docs/editorial/evidence/shadow-review.md",
            "docs/snapshots/example.json",
            "docs/release-candidates/older-spec.md",
        ]

    def test_existing_canonical_and_nested_files_pass(self):
        self.assertEqual([], validate_layout(self.valid_paths))

    def test_new_file_at_docs_root_fails(self):
        problems = validate_layout(self.valid_paths + ["docs/editorial-publisher-design.md"])
        self.assertEqual(1, len(problems))
        self.assertIn("docs/editorial-publisher-design.md", problems[0])

    def test_new_json_at_docs_root_also_fails(self):
        problems = validate_layout(self.valid_paths + ["docs/experimental.schema.json"])
        self.assertEqual(1, len(problems))

    def test_new_file_inside_indexed_existing_workstream_passes(self):
        self.assertEqual(
            [], validate_layout(self.valid_paths + ["docs/editorial/publisher/rollout.md"])
        )

    def test_new_workstream_requires_readme(self):
        problems = validate_layout(self.valid_paths + ["docs/new-workstream/first.md"])
        self.assertEqual(1, len(problems))
        self.assertIn("docs/new-workstream/README.md", problems[0])

    def test_new_workstream_with_readme_passes(self):
        self.assertEqual(
            [],
            validate_layout(
                self.valid_paths + ["docs/new-workstream/README.md",
                                    "docs/new-workstream/first.md"]
            ),
        )

    def test_legacy_immutable_folders_do_not_require_readme(self):
        self.assertEqual([], validate_layout(self.valid_paths))

    def test_docs_index_cannot_be_removed(self):
        paths = [p for p in self.valid_paths if p != "docs/README.md"]
        self.assertTrue(any("docs/README.md" in item for item in validate_layout(paths)))

    def test_exception_must_be_explicit(self):
        self.assertNotIn("new-canonical-spec.md", APPROVED_ROOT_FILES)

    def test_files_outside_docs_are_ignored(self):
        self.assertEqual(
            [], validate_layout(self.valid_paths + ["README.md", "site/test.html"])
        )


if __name__ == "__main__":
    unittest.main()
