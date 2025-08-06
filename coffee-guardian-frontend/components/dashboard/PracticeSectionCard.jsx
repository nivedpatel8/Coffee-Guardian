import React from "react";

function PracticeSectionCard({
  section,
  items,
  initialChecked,
  onStatusChange,
  minHeight,
}) {
  const [checked, setChecked] = React.useState(initialChecked);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    console.log(
      "PracticeSectionCard",
      section,
      "initialChecked updated:",
      initialChecked
    );
    setChecked(initialChecked);
  }, [initialChecked]);

  const toggleItem = (index) => {
    const updated = [...checked];
    updated[index] = !updated[index];
    setChecked(updated);
    onStatusChange(section, updated);
  };

  const handleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <section
      className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-2xl px-6 py-6 shadow-lg flex flex-col"
      style={isCollapsed ? {} : { minHeight: minHeight || 280 }}
      aria-label={`${section} Practices`}
    >
      {/* Title and collapse toggle */}
      <div
        className="flex items-center justify-between mb-4 border-b border-amber-400 pb-2 cursor-pointer select-none"
        onClick={handleCollapse}
        style={{ userSelect: "none" }}
      >
        <h3 className="!text-amber-300 font-extrabold text-xl md:text-2xl tracking-wider uppercase mb-0">
          {section}
        </h3>
        <span className="ml-2 text-amber-300">
          {isCollapsed ? (
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          {items.length === 0 ? (
            <div className="italic text-gray-400 py-6">
              No practices for this section.
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-3 flex-1">
              {items.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start space-x-3 ${
                    checked[i] ? "opacity-70 line-through" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={() => toggleItem(i)}
                    id={`${section}-item-${i}`}
                    className="cursor-pointer h-5 w-5 rounded border-gray-400 focus:ring-amber-500 text-amber-500 transition"
                    style={{
                      marginTop: "2px",
                      minWidth: "1.5rem",
                      minHeight: "1.5rem",
                    }}
                  />
                  <label
                    htmlFor={`${section}-item-${i}`}
                    className="select-none cursor-pointer text-gray-100"
                    style={{ lineHeight: 1.2 }}
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default PracticeSectionCard;
