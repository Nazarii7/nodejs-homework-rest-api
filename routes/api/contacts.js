const express = require("express");
const { tryCatchWrapper } = require("../../helpers/index");
const {
  getContacts,
  getContact,
  createContact,
  removedContact,
  createPutContact,
  createStatusContact,
} = require("../../controllers/contacts.controllers");

const { validate, auth } = require("../../middlewares/index");
const { addContactSchema, favoriteSchema } = require("../../schemas/contacts");

const router = express.Router();

router.get("/", tryCatchWrapper(auth), tryCatchWrapper(getContacts));

router.get("/:contactId", tryCatchWrapper(auth), tryCatchWrapper(getContact));

router.post(
  "/",
  tryCatchWrapper(auth),
  validate(addContactSchema),
  tryCatchWrapper(createContact)
);

router.delete(
  "/:contactId",
  tryCatchWrapper(auth),
  tryCatchWrapper(removedContact)
);

router.put(
  "/:contactId",
  tryCatchWrapper(auth),
  validate(addContactSchema),
  tryCatchWrapper(createPutContact)
);

router.patch(
  "/:contactId/favorite",
  tryCatchWrapper(auth),
  validate(favoriteSchema),
  tryCatchWrapper(createStatusContact)
);

module.exports = router;
