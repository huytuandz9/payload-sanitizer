import { sanitize } from "payload-sanitizer";

const formValues = {
  paymentTransactionId: "",
  voidStatus: "-",
  fromDate: " 2026-02-01 ",
  toDate: "",
  paginationRequest: { page: 1, size: 10 },
};

const payload = sanitize(formValues, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
  dropEmptyObjects: true,
});

console.log(payload);
