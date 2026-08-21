frappe.ui.form.on("Sales Invoice", {
    refresh(frm) {
        frm.add_custom_button("Discount Inserter", () => {
            frappe.prompt(
                {
                    fieldname: "discount_percentage",
                    fieldtype: "Float",
                    label: "Discount Percentage",
                    reqd: 1,
                    description: "Enter discount percentage to apply to all items",
                },
                (values) => {
                    const discount_percentage = flt(values.discount_percentage);

                    if (discount_percentage < 0 || discount_percentage > 100) {
                        frappe.msgprint({
                            title: __("Invalid Discount"),
                            message: __("Discount percentage must be between 0 and 100."),
                            indicator: "red",
                        });
                        return;
                    }

                    if (!frm.doc.items || !frm.doc.items.length) {
                        frappe.msgprint({
                            title: __("No Items"),
                            message: __("Please add at least one item before applying discount."),
                            indicator: "orange",
                        });
                        return;
                    }

                    // Apply discount to every item
                    const updates = frm.doc.items.map(row => {
                        return frappe.model.set_value(
                            row.doctype,
                            row.name,
                            "discount_percentage",
                            discount_percentage
                        );
                    });

                    Promise.all(updates).then(() => {
                        frm.refresh_field("items");

                        // Recalculate totals
                        frm.trigger("calculate_taxes_and_totals");

                        frappe.show_alert({
                            message: __(
                                "Discount of {0}% applied to {1} item(s).",
                                [discount_percentage, frm.doc.items.length]
                            ),
                            indicator: "green",
                        });
                    });
                },
                __("Discount Inserter"),
                __("Apply Discount")
            );
        });
    },
});