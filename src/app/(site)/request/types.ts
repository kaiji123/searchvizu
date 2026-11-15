export type FieldName =
  | "name"
  | "email"
  | "institution"
  | "role"
  | "package"
  | "topic"
  | "description"
  | "materialsUrl"
  | "uses"
  | "deadline"
  | "sharing"
  | "embargoUntil";

export type IntakeState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | {
      status: "error";
      message: string;
      errors: Partial<Record<FieldName, string>>;
      // Echo values back so the form keeps what the user typed.
      values: Partial<Record<FieldName, string | string[]>>;
    };
