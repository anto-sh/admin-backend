---
name: integrate-backend-entity-validation
description: Connect a backend entity's DTOs, controllers, and service errors to the existing shared validation module. Use when adopting this module under an agreed entity API contract.
---

# Integrate backend entity validation

## Establish the integration boundary

Use the agreed entity contract. Resolve missing contract decisions through
[align-backend-entity-contract](../align-backend-entity-contract/SKILL.md)
when needed; do not reopen settled decisions or copy Service-specific rules.

Read [DOCS, section 2](../../../DOCS.md#2-dto-validation-and-response-mapping)
and the [validation module README](../../../src/shared/validation/README.md).
Check applicable module limits before replacing existing validation,
especially for nested arrays, conditional rules, and renamed DTO fields.

Import the public API from `src/shared/validation` and validation codes from
`@anto-sh/admin-network-shared`. Keep shared module changes and app-wide JSON
parser configuration outside this entity integration; propose unsupported
requirements separately.

## Connect DTO rules

Attach `validationContext({ code, params? })` to every class-validator rule
that can report an input error, including rules in item and nested DTOs.
Use shared codes and their typed parameters instead of exposing rule messages.
For numeric fields, keep the `IsNumber` base-type check separate from an
`IsInt` constraint when the contract requires integers.

Reuse shared transformations such as `trimStringTransform` where the contract
requires them. Preserve invalid types for validation; transformations and
defaults must not populate omitted fields during partial updates.

For supported array fields, use `ValidateItems(ItemDto, { maxSize })` and put
element rules and transformations on the item DTO's `value` property.
The decorator supplies `IsArray` and the maximum-size rule. Keep requiredness,
null handling, and any minimum-size or uniqueness rules on the owning DTO.
Use one agreed maximum; do not duplicate the decorator's container rules.

## Connect controllers and manual errors

Replace local transformation and validation pipelines with awaited
`validateDto(Dto, req.body)`. Pass its returned, transformed DTO to the service.
Use `{ partial: true }` only for an agreed partial update and `{ array: true }`
only for an existing root-batch contract.

Follow the README's [omission, null, and partial-update semantics](../../../src/shared/validation/README.md#validatedto)
when choosing DTO decorators; do not add a second validation pass.

Use `throw createValidationError(issues, optionalStatus)` for manual input,
reference, and business validation failures. Supply `path`, shared `code`,
and applicable `params`; use numeric array indices and `[]` for the root.
The default status is 422; preserve the contract's explicit status overrides.
Do not put submitted values or library messages into public issues.

Keep identifier checks in controllers and reference/business checks in
services. Convert only recognized persistence failures; preserve unrelated
exceptions and existing non-validation errors.

Remove local root-shape, unknown-field, empty-update, and error-normalization
logic only after confirming that the shared module covers every affected
path with the required semantics. Do not remove independent business checks.

## Verify the integration

Check that downstream code receives transformed DTOs and that failures expose
`NetworkError` status and `data.validationErrors` in the shared format.
Exercise applicable omission/null, unknown-field, array-index, and manual-error
cases; investigate unexpected `INVALID_VALUE` fallbacks or diagnostics.

Run existing validation tests and relevant type checks using the current
package scripts or commands in the module README. Use isolated diagnostic
calls when needed; creating or modifying tests requires an explicit request.
Do not start the application or database for DTO checks.

Report migrated paths, checks performed, and any remaining module limitations
or client compatibility work without extending the entity's agreed contract.
