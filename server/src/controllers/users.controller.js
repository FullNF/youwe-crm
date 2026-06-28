const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const usersRepo = require('../services/users.repository');

const list = asyncHandler(async (req, res) => ok(res, await usersRepo.getAll()));

const me = asyncHandler(async (req, res) => ok(res, req.user));

const create = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;
  if (!email) return fail(res, 'email is required', 422);
  const existing = await usersRepo.getByEmail(email);
  if (existing) return fail(res, 'A user with this email already exists', 409);
  const user = await usersRepo.create({ email, name, role });
  return created(res, user);
});

const update = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const updated = await usersRepo.update(email, req.body);
  if (!updated) return fail(res, 'User not found', 404);
  return ok(res, updated);
});

const remove = asyncHandler(async (req, res) => {
  const removed = await usersRepo.remove(req.params.email);
  if (!removed) return fail(res, 'User not found', 404);
  return ok(res, { email: req.params.email, deleted: true });
});

module.exports = { list, me, create, update, remove };
