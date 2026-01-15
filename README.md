# 삼체 시뮬레이션: 소설 속 '삼체' 환경의 현실성 탐구
# Three-Body Simulation: Exploring the Reality of Trisolaris

🔗 **시뮬레이션 해보기 (Live Demo):** [https://cupfeedback.github.io/threebody-problem-simulation/](https://cupfeedback.github.io/threebody-problem-simulation/)

이 repo는 넷플릭스 드라마 삼체(3 Body Problem)와 원작 소설을 보고, 소설 속에 묘사된 '삼체인들의 환경'이 과연 물리학적으로 구현 가능한지 궁금해서 시작하게 되었습니다.

## 🧪 직접 구현하며 발견한 사실들 (Findings)

제가 직접 코드를 짜서 다양한 시뮬레이션을 돌려본 결과, "소설 속의 삼체 환경은 **실제로 구현하기가 거의 불가능**에 가깝다"는 것을 발견했습니다.

1.  **완전 무작위(Random) 환경의 한계**:
    *   초기 조건을 완전히 랜덤하게 설정하면, 시작하자마자 행성이 중력을 이기지 못하고 우주 저 멀리 뿔뿔이 흩어져 버립니다.
    *   소설처럼 세 개의 태양 사이에서 아슬아슬하게 살아남는 '난하기(Chaotic Era)'가 지속되기가 매우 어렵습니다.

2.  **수많은 제약 조건의 필요성**:
    *   소설과 비슷한 환경을 아주 잠깐이라도 흉내 내려면, '음의 에너지'나 '중력 벽' 같은 강한 물리적 제약 조건을 걸어야만 했습니다.
    *   하지만 이마저도 오래가지 못하고, 결국 별 하나가 먼저 탈출하거나 시스템이 붕괴되었습니다.

3.  **안정적인 Figure-8 궤도의 역설**:
    *   수학적으로 유일하게 안정적인 '8자 궤도(Figure-8)'에서도 실험을 해보았습니다.
    *   하지만 행성은 이 안에서도 결국 견디지 못하고 사라져 버렸습니다.
    *   무엇보다 Figure-8 궤도는 **규칙적**이기 때문에, 소설의 핵심 설정인 "예측 불가능성"과 맞지 않습니다. 이 경우 삼체인들은 달력을 만들 수 있었을 것입니다.

4.  **결론**:
    *   소설에서 묘사된 "세 개의 태양이 일직선으로 늘어서 행성을 불바다로 만드는" 장면은 시뮬레이션 아주 초기에나 잠깐 나올 수 있는 희귀한 현상입니다.
    *   대부분의 경우 행성은 시스템에서 너무 빨리 튕겨 나가버려 두 번 다시 돌아오지 않습니다.

이 프로젝트는 **별의별 게 다 궁금했던 한 사람**이 직접 물리학 엔진을 구현해 보며, 소설적 상상력과 물리적 현실 사이의 괴리를 탐구해 본 결과물입니다.

---

## 🇬🇧 English Description

This project started from a simple curiosity after watching the **Netflix series '3 Body Problem'** and reading the original novel: **"Is the environment of Trisolaris actually physically possible?"**

### 🧪 What I Discovered

After coding and running various simulations myself, I discovered that **"implementing the Three-Body environment as described in the novel is nearly impossible."**

1.  **Limitations of Pure Randomness**:
    *   In a completely random setup, planets are almost instantly ejected into deep space, unable to withstand the gravitational chaos.
    *   The sustaining "Chaotic Era" described in the book is extremely rare to achieve naturally.

2.  **The Need for Heavy Constraints**:
    *   To even slightly mimic the novel's scenario, I had to impose heavy constraints like 'Negative Total Energy' or artificial 'Gravity Walls'.
    *   Even with these cheats, the system was unstable, and one star would eventually escape first.

3.  **The Paradox of the Stable Figure-8**:
    *   I tested the mathematically stable 'Figure-8' solution.
    *   However, even here, the planet eventually gets ejected.
    *   More importantly, since Figure-8 orbits are **periodic and predictable**, it contradicts the novel's core premise of "unpredictability." If this were the case, the Trisolarans could have easily created a calendar.


4.  **Conclusion**:
    *   Scenes like "three suns aligning (Syzygy) to scorch the planet" are incredibly rare moments that might happen only at the very beginning.
    *   In most simulations, the planet is ejected from the system too quickly, never to return.

This project is the result of **one very curious person** implementing a physics engine from scratch to explore the gap between fictional imagination and physical reality.
