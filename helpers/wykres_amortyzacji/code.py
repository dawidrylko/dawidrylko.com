import matplotlib.pyplot as plt
import numpy as np

n = 1000
k_max = 100

k = np.arange(0, k_max + 1)
T_array = k * n
T_map = n + k * 1

plt.figure(figsize=(10, 6))
plt.plot(k, T_array, label='Array: T = k·n', color='#e74c3c', linewidth=2)
plt.plot(k, T_map, label='Map: T = n + k', color='#3498db', linewidth=2)

k_cross = n / (n - 1)
T_cross = n + k_cross
plt.plot(k_cross, T_cross, 'go', markersize=10, label=f'Punkt opłacalności (k≈{k_cross:.1f})')

plt.axvline(x=k_cross, color='green', linestyle='--', alpha=0.3)
plt.fill_between(k, 0, k_max * n * 1.1, where=(k >= k_cross), alpha=0.1, color='green', label='Strefa opłacalności Map')

plt.xlabel('Liczba wyszukiwań (k)', fontsize=12)
plt.ylabel('Całkowity koszt czasowy', fontsize=12)
plt.title(f'Amortyzacja kosztu: Array vs Map (n={n})', fontsize=14, fontweight='bold')
plt.legend(fontsize=10)
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('amortyzacja_array_vs_map.png', dpi=300, bbox_inches='tight')
print("Wykres zapisany jako: amortyzacja_array_vs_map.png")
plt.show()
