import { useState } from "react";
import { getFilterLabel, getTagLabel } from "@/utils/displayLabels";

const Dropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-45">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-zinc-800 px-4 py-2 rounded-lg flex justify-between"
      >
        {value ? getFilterLabel(value) || getTagLabel(value) : label}
        <span>▼</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-2xl custom-scrollbar">
          {options.map((item) => (
            <div
              key={item}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-zinc-700 cursor-pointer"
            >
              {getFilterLabel(item) || getTagLabel(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex gap-4 flex-wrap">

      {/* Price */}
      <Dropdown
        label="Giá"
        value={filters.price}
        options={["All", "Free", "Paid"]}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, price: val }))
        }
      />

      {/* Tags */}
      <Dropdown
        label="Tags"
        value={filters.tag}
        options={[
          "Racing","Arcade","Cyberpunk","RPG","Adventure","Story",
          "Puzzle","Cozy","Simulation","Horror","Sci-Fi","Strategy",
          "Turn-Based","Fantasy","Casual","Indie"
        ]}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, tag: val }))
        }
      />

      {/* Ownership*/}
      <Dropdown
        label="Quyền sở hữu"
        value={filters.ownership}
        options={["All", "Purchased", "NotPurchased"]}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, ownership: val }))
        }
      />

      {/* Sort */}
      <Dropdown
        label="Sắp xếp"
        value={filters.sort}
        options={["Newest", "Price", "Rating"]}
        onChange={(val) =>
          setFilters((prev) => ({ ...prev, sort: val }))
        }
      />

    </div>
  );
}
