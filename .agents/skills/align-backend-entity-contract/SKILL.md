---
name: align-backend-entity-contract
description: Define and implement an agreed API contract for a backend entity across its DTOs, persistence model, controller, and service. Use when aligning or correcting an entity's CRUD contract.
---

# Align a backend entity contract

## Establish the contract

Inspect the selected entity's request and response DTOs, persistence
mapping, controller, and service. Distinguish current behavior from
the intended contract.

Build a compact field matrix covering the applicable decisions:

- Input and output types.
- Required fields on creation and the meaning of omission on update.
- Whether null is allowed.
- Defaults and the meaning of empty values.
- String lengths, collection sizes, numeric ranges and precision.
- Accepted formats and normalization.
- Rules for collection elements and references to other entities.

Ask the user to resolve field constraints before implementing them,
unless those decisions are already explicitly agreed. Offer typical
options appropriate to the entity and explain relevant tradeoffs.
Group related questions. Do not invent business limits or treat
existing decorators and database columns as user approval.

Agree on operation semantics where unresolved:

- Creation and update methods.
- Unknown fields and empty update requests.
- Replacement, merging, and clearing of collections.
- Missing resources and invalid references.
- Response fields, statuses, and validation errors.

Do not impose PATCH, PUT, full update responses, or specific statuses
independently of the agreed contract.

## Apply the contract

Align creation and update DTOs with the agreed rules. Ensure validation
actually runs at the input boundary; validation metadata alone is
insufficient. Preserve the distinction between omitted fields, null,
and valid empty values.

Check that persistence types, collection storage, and relation mappings
preserve valid data. Identify any required existing-data conversion
separately; do not assume data can be discarded.

Map only writable fields from DTOs to persistence objects. For partial
updates, omitted fields must not overwrite existing values.

In the controller, validate request shape, identifiers, and fields.
Use the existing response and validation-error conventions without
exposing whole input objects.

In the service, validate supplied references and relevant business
conditions. Translate recognized persistence failures into the
established domain or field errors; do not disguise unrelated failures
as validation errors.

Ensure update behavior does not accidentally create missing records.
Return the agreed response shape from the actual persisted result.

## Verify and hand off

Check affected entity paths and directly related response shapes.
Run relevant checks according to repository instructions.

Report the resulting field and operation contract, completed changes,
remaining compatibility work, and deferred decisions. The contract
summary should be sufficient for frontend integration.

Keep changes scoped to the selected entity and its direct dependencies.
Reuse shared infrastructure. If a shared mechanism needs modification,
propose that as a separate scope expansion. Do not automatically modify
the frontend or introduce contract generation.
