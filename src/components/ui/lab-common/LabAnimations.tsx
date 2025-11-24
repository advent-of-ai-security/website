export const LabAnimations = () => (
  <style>{`
    @keyframes flow-right {
      0% { transform: translateX(0); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateX(32px); opacity: 0; }
    }
    @keyframes flow-down {
      0% { transform: translateY(0); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(32px); opacity: 0; }
    }
    .animate-flow-right { animation: flow-right 2.5s infinite linear; }
    .animate-flow-down { animation: flow-down 2.5s infinite linear; }
  `}</style>
);
