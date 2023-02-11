const { ValidationError } = require("../helpers/index");
const { Contact } = require("../models/contactShema");

async function getContacts(req, res, next) {
  const { _id } = req.user;
  const { page = 1, limit = 10, favorite = [true, false] } = req.query;
  const skip = (page - 1) * limit;
  const contacts = await Contact.find({ owner: _id, favorite }, "", {
    skip,
    limit: Number(limit),
  }).populate("owner", "_id email subscription");
  res.json({
    message: "Contacts Found",
    data: contacts,
  });
  return contacts;
}

async function getContact(req, res, next) {
  const { _id } = req.user;
  const { contactId } = req.params;
  const contact = await Contact.findOne({ owner: _id, _id: contactId });

  if (!contact) {
    return next(ValidationError(404, "Contact Not Found"));
  }
  return res.json({ message: "Contact found", data: contact });
}

async function createContact(req, res, next) {
  const { _id } = req.user;
  const newContacts = await Contact.create({ ...req.body, owner: _id });
  res.status(201).json({ message: "Contact added", data: newContacts });
  return newContacts;
}

async function createPutContact(req, res, next) {
  const { _id } = req.user;
  const { contactId } = req.params;
  const contact = await Contact.findOne({ owner: _id, _id: contactId });
  if (!contact) {
    return next(ValidationError(404, "Contact Not Found"));
  }
  const updateContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  res.status(200).json({ message: "Contact update", data: updateContact });
}

async function createStatusContact(req, res, next) {
  const { contactId } = req.params;
  const { _id } = req.user;

  const { favorite } = req.body;
  const contact = await Contact.findOne({ owner: _id, _id: contactId });
  if (!contact) {
    return next(createError(404, "Contact Not Found"));
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    { favorite },
    {
      new: true,
    }
  );

  res.json({ message: "Contact updated", data: updatedContact });
}

async function removedContact(req, res, next) {
  const { _id } = req.user;
  const { contactId } = req.params;
  const contact = await Contact.findOne({ owner: _id, _id: contactId });
  await Contact.findByIdAndRemove(contactId);
  if (!contact) {
    return next(ValidationError(404, `Not found contact with id=${contactId}`));
  }

  return res.status(200).json({ message: "Contact deleted", data: contact });
}

module.exports = {
  getContacts,
  getContact,
  createContact,
  createPutContact,
  createStatusContact,
  removedContact,
};
