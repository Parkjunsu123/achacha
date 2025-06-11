package com.eurachacha.achacha.web.common.exception;

import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FilterExceptionHandler extends OncePerRequestFilter {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		try {
			// 필터에서 발생하는 모든 예외 처리
			filterChain.doFilter(request, response);
		} catch (CustomException e) {
			log.error("필터에서 예외 발생: {}", e.getMessage());
			sendErrorResponse(response, e.getErrorCode());
		} catch (Exception e) {
			log.error("필터에서 처리되지 않은 예외 발생: {}", e.getMessage());
			sendErrorResponse(response, ErrorCode.INTERNAL_SERVER_ERROR);
		}
	}

	private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode) throws IOException {
		response.setStatus(errorCode.getStatus().value());
		response.setContentType("application/json;charset=UTF-8");

		ErrorResponse errorResponse = ErrorResponse.of(errorCode);
		response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
	}
}
