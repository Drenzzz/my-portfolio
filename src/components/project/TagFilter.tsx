import { useState } from "react";

interface Props {
  tags: string[];
}

export function TagFilter({ tags }: Props) {
  const [active, setActive] = useState("All");

  const handleFilter = (tag: string) => {
    setActive(tag);

    const grid = document.getElementById("project-grid");
    const noResults = document.getElementById("no-results");
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-tags]");
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardTags = card.getAttribute("data-tags") || "";
      if (tag === "All" || cardTags.split(",").includes(tag)) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (noResults) {
      noResults.classList.toggle("hidden", visibleCount > 0);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {["All", ...tags].map((tag) => (
        <button
          key={tag}
          onClick={() => handleFilter(tag)}
          className={`px-4 py-1.5 text-sm font-bold font-head border-2 border-black rounded-lg transition-all cursor-pointer ${
            active === tag
              ? "bg-[#E6A627] shadow-brutal-sm -translate-y-0.5"
              : "bg-white hover:bg-muted hover:-translate-y-0.5"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
