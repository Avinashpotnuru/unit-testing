const displayName = (firstName, lastName) => {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();

  if (!first && !last) {
    return "Anonymous";
  }

  return [first, last].filter(Boolean).join(" ");
};

module.exports = displayName;
