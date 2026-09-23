# Architecture
Detect → Compare → Risk check → Checkpoint → User decision when required → Apply → Validate → Freeze or Recover → Report.

Automatic by default: inspection, comparison, validation, checkpointing, history and validated phase freeze.
Ask first: major schema migration, locked feature replacement, privacy changes, permanent deletion and external/repository actions.

State keys are local: sciencehub-upgrade-guard-state-v1, history-v1 and checkpoints-v1.
